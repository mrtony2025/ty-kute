// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal"
#include "GameFramework/Actor.h"
#include "PuzzleBase.generated.h"

// Enum definition for Puzzle States
UENUM(BlueprintType)
enum class EPuzzleState : uint8
{
	Locked           UMETA(DisplayName = "Locked"),
	ReadyToInteract  UMETA(DisplayName = "Ready To Interact"),
	ActiveInUI       UMETA(DisplayName = "Active In UI"),
	Solved           UMETA(DisplayName = "Solved"),
	Failed           UMETA(DisplayName = "Failed")
};

// Event Dispatcher for Puzzle Solved Event
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnPuzzleSolved);

// Event Dispatcher for Puzzle Failures (e.g. to trigger jump scares or light flicker in level script)
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnPuzzleFailurePenalty, int32, CurrentFailedAttempts);

UCLASS()
class TYKUTE_API APuzzleBase : public AActor
{
	GENERATED_BODY()
	
public:	
	// Sets default values for this actor's properties
	APuzzleBase();

protected:
	// Called when the game starts or when spawned
	virtual void BeginPlay() override;

public:	
	// Event triggered when the puzzle is successfully solved
	UPROPERTY(BlueprintAssignable, Category = "Horror Puzzle")
	FOnPuzzleSolved OnPuzzleSolved;

	// Event triggered when the player fails an attempt to solve
	UPROPERTY(BlueprintAssignable, Category = "Horror Puzzle")
	FOnPuzzleFailurePenalty OnPuzzleFailurePenalty;

	// Call when player interacts with the puzzle mesh/trigger in-world
	UFUNCTION(BlueprintCallable, Category = "Horror Puzzle")
	virtual void InteractWithPuzzle(ACharacter* PlayerChar);

	// Submit solution data from UI Widget
	UFUNCTION(BlueprintCallable, Category = "Horror Puzzle")
	virtual void SubmitSolution(FString SolutionData);

	// Explicitly marks the puzzle as solved
	UFUNCTION(BlueprintCallable, Category = "Horror Puzzle")
	void SolvePuzzle();

	// Inflicts panic penalties and registers a failure
	UFUNCTION(BlueprintCallable, Category = "Horror Puzzle")
	void FailPuzzleAttempt();

	// Check if the submitted solution matches the answer (intended to be overridden in Blueprints)
	UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category = "Horror Puzzle")
	bool CheckSolutionCorrect(const FString& SolutionData);

	// Getters and Setters
	UFUNCTION(BlueprintPure, Category = "Horror Puzzle")
	EPuzzleState GetPuzzleState() const { return PuzzleState; }

	UFUNCTION(BlueprintPure, Category = "Horror Puzzle")
	int32 GetCurrentFailedAttempts() const { return CurrentFailedAttempts; }

protected:
	// Closes the puzzle interaction UI (to be overridden or implemented by blueprint ui integration)
	UFUNCTION(BlueprintImplementableEvent, Category = "Horror Puzzle")
	void OpenPuzzleUIWidget();

	UFUNCTION(BlueprintImplementableEvent, Category = "Horror Puzzle")
	void ClosePuzzleUIWidget();

	UFUNCTION(BlueprintImplementableEvent, Category = "Horror Puzzle")
	void ShowSubtitle(const FString& SubtitleText);

	// Checks if the player has discovered all required clues (mocked verification)
	bool HasRequiredClues(ACharacter* PlayerChar);

protected:
	// Unique Identifier for this puzzle instance
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Horror Puzzle|Config")
	FName PuzzleID;

	// State of the puzzle
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Horror Puzzle|State")
	EPuzzleState PuzzleState;

	// List of clues (IDs) required to be gathered before interaction is unlocked
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Horror Puzzle|Config")
	TArray<FName> RequiredClues;

	// Maximum failed attempts before high penalty event is forced
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Horror Puzzle|Config")
	int32 MaxAttempts;

	// Currently recorded failed attempts
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Horror Puzzle|State")
	int32 CurrentFailedAttempts;
};
