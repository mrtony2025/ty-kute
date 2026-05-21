// Fill out your copyright notice in the Description page of Project Settings.

#include "PuzzleBase.h"
#include "BPC_FearDirector.h"
#include "GameFramework/Character.h"
#include "GameFramework/PlayerController.h"
#include "Kismet/GameplayStatics.h"
#include "Engine/Engine.h"

// Sets default values
APuzzleBase::APuzzleBase()
{
	PrimaryActorTick.bCanEverTick = false;

	PuzzleID = FName(TEXT("Puzzle_Default"));
	PuzzleState = EPuzzleState::Locked;
	MaxAttempts = 3;
	CurrentFailedAttempts = 0;
}

// Called when the game starts or when spawned
void APuzzleBase::BeginPlay()
{
	Super::BeginPlay();
	
	// If no clues are required, start as ReadyToInteract
	if (RequiredClues.Num() == 0)
	{
		PuzzleState = EPuzzleState::ReadyToInteract;
	}
}

// Player interact with the puzzle
void APuzzleBase::InteractWithPuzzle(ACharacter* PlayerChar)
{
	if (!PlayerChar) return;

	if (PuzzleState == EPuzzleState::Solved)
	{
		ShowSubtitle(TEXT("Câu đố này đã được giải xong."));
		return;
	}

	// Verify narrative progression clues
	if (!HasRequiredClues(PlayerChar))
	{
		ShowSubtitle(TEXT("Tôi chưa hiểu quy luật của thứ này... Cần thêm manh mối."));
		// Trigger a minor local warning sound if implemented
		return;
	}

	PuzzleState = EPuzzleState::ActiveInUI;
	OpenPuzzleUIWidget();
}

// Submit a solution from the puzzle widget
void APuzzleBase::SubmitSolution(FString SolutionData)
{
	if (PuzzleState != EPuzzleState::ActiveInUI) return;

	if (CheckSolutionCorrect(SolutionData))
	{
		SolvePuzzle();
	}
	else
	{
		FailPuzzleAttempt();
	}
}

// Marks the puzzle as solved
void APuzzleBase::SolvePuzzle()
{
	PuzzleState = EPuzzleState::Solved;
	ClosePuzzleUIWidget();
	
	ShowSubtitle(TEXT("Có tiếng cạch nhẹ phát ra... Thành công rồi!"));
	OnPuzzleSolved.Broadcast();
}

// Applies failure penalty and stress increase
void APuzzleBase::FailPuzzleAttempt()
{
	CurrentFailedAttempts++;
	OnPuzzleFailurePenalty.Broadcast(CurrentFailedAttempts);

	// Try to locate the player character and retrieve the Fear Director component
	APlayerController* PC = UGameplayStatics::GetPlayerController(GetWorld(), 0);
	if (PC)
	{
		ACharacter* PlayerChar = Cast<ACharacter>(PC->GetPawn());
		if (PlayerChar)
		{
			UBPC_FearDirector* FearDirector = PlayerChar->FindComponentByClass<UBPC_FearDirector>();
			if (FearDirector)
			{
				// Puzzle failures cause immediate panic
				FearDirector->AddStressInstant(15.0f);
				
				if (CurrentFailedAttempts >= MaxAttempts)
				{
					// Penalize severely: kick player out of UI, trigger high stress jumpscare event
					ClosePuzzleUIWidget();
					FearDirector->AddStressInstant(30.0f);
					
					// Force state back to ReadyToInteract so they can try again later
					PuzzleState = EPuzzleState::Failed;
					CurrentFailedAttempts = 0;
					
					ShowSubtitle(TEXT("Một luồng khí lạnh ập đến... Tôi phải chạy ngay!"));
					return;
				}
			}
		}
	}

	ShowSubtitle(TEXT("Không đúng... Có gì đó đang tới gần hơn."));
}

// Default native implementation of solution check
bool APuzzleBase::CheckSolutionCorrect_Implementation(const FString& SolutionData)
{
	// Default check. Override this in Blueprints to build custom keypad, dials or item match puzzles
	return SolutionData.Equals(TEXT("correct"), ESearchCase::IgnoreCase);
}

// Helper checking for gathered clues
bool APuzzleBase::HasRequiredClues(ACharacter* PlayerChar)
{
	if (RequiredClues.Num() == 0)
	{
		return true;
	}

	// Prototype stub: In a production game, we would get the character's NarrativeTracker component
	// and call NarrativeTracker->HasDiscoveredClues(RequiredClues).
	// For testing, we log the checked list and return true.
	UE_LOG(LogTemp, Log, TEXT("Checking required clues for Puzzle: %s"), *PuzzleID.ToString());
	for (const FName& Clue : RequiredClues)
	{
		UE_LOG(LogTemp, Log, TEXT(" - Requires Clue: %s"), *Clue.ToString());
	}

	return true; 
}
