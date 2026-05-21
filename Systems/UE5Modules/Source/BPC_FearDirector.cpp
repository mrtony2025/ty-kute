// Fill out your copyright notice in the Description page of Project Settings.

#include "BPC_FearDirector.h"
#include "Kismet/GameplayStatics.h"
#include "GameFramework/Character.h"
#include "TimerManager.h"

// Sets default values for this component's properties
UBPC_FearDirector::UBPC_FearDirector()
{
	PrimaryComponentTick.bCanEverTick = false; // Disable tick to save CPU

	PlayerStress = 0.0f;
	bIsInDarkness = false;
	bCooldownActive = false;
	CooldownDuration = 30.0f;
	TargetEntityActor = nullptr;
}

// Called when the game starts
void UBPC_FearDirector::BeginPlay()
{
	Super::BeginPlay();

	// Initialize the director loop to evaluate stress and trigger scares every 1.0 second
	GetOwner()->GetWorldTimerManager().SetTimer(
		DirectorTimerHandle, 
		this, 
		&UBPC_FearDirector::EvaluateStressAndEvents, 
		1.0f, 
		true
	);
}

// Dynamic Stress Calculation & Evaluation
void UBPC_FearDirector::EvaluateStressAndEvents()
{
	if (bCooldownActive)
	{
		// Gradually decay stress during cooldown
		PlayerStress = FMath::Max(0.0f, PlayerStress - 0.2f);
		return;
	}

	float StressGain = 0.0f;

	// 1. Darkness Stress Penalty
	if (bIsInDarkness)
	{
		StressGain += 1.5f;
	}

	// 2. Proximity to Entity Penalty
	float DistanceToGhost = GetDistanceToGhost();
	if (DistanceToGhost > 0.0f)
	{
		if (DistanceToGhost < 500.0f) // 5 meters
		{
			StressGain += 5.0f;
		}
		else if (DistanceToGhost < 1500.0f) // 15 meters
		{
			StressGain += 2.0f;
		}
	}

	// 3. Update Stress or Decay if no threat
	if (StressGain == 0.0f)
	{
		PlayerStress = FMath::Max(0.0f, PlayerStress - 0.5f);
	}
	else
	{
		PlayerStress = FMath::Min(100.0f, PlayerStress + StressGain);
	}

	// 4. Evaluate Scare Event Triggering
	EvaluateParanormalTrigger();
}

// Decides if a paranormal event should trigger based on Stress levels
void UBPC_FearDirector::EvaluateParanormalTrigger()
{
	if (PlayerStress < 30.0f || bCooldownActive)
	{
		return;
	}

	EParanormalSeverity Severity = EParanormalSeverity::LOW;

	if (PlayerStress > 80.0f)
	{
		Severity = EParanormalSeverity::HIGH;
	}
	else if (PlayerStress > 60.0f)
	{
		Severity = EParanormalSeverity::MEDIUM;
	}

	// Probability Roll: 25% chance of triggering when conditions are met
	float Roll = FMath::FRandRange(0.0f, 100.0f);
	if (Roll < 25.0f)
	{
		bCooldownActive = true;
		
		// Broadcast the event to listener Blueprint Managers/Level Script
		OnScareEventTriggered.Broadcast(Severity);

		// Start Cooldown timer to prevent spamming scares
		GetOwner()->GetWorldTimerManager().SetTimer(
			CooldownTimerHandle, 
			this, 
			&UBPC_FearDirector::ClearCooldown, 
			CooldownDuration, 
			false
		);
	}
}

void UBPC_FearDirector::AddStressInstant(float Amount)
{
	PlayerStress = FMath::Clamp(PlayerStress + Amount, 0.0f, 100.0f);
	
	// Force immediate evaluation on high sudden stress addition
	if (PlayerStress >= 60.0f && !bCooldownActive)
	{
		EvaluateParanormalTrigger();
	}
}

void UBPC_FearDirector::ClearCooldown()
{
	bCooldownActive = false;
}

float UBPC_FearDirector::GetDistanceToGhost() const
{
	if (!TargetEntityActor)
	{
		return -1.0f;
	}

	APlayerController* PC = UGameplayStatics::GetPlayerController(GetWorld(), 0);
	if (PC && PC->GetPawn())
	{
		return FVector::Distance(PC->GetPawn()->GetActorLocation(), TargetEntityActor->GetActorLocation());
	}

	return -1.0f;
}
