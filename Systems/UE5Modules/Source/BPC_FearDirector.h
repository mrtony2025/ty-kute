// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal"
#include "Components/ActorComponent.h"
#include "GameplayTagContainer.h"
#include "BPC_FearDirector.generated.h"

// Enum definition for Severity of Paranormal Events
UENUM(BlueprintType)
enum class EParanormalSeverity : uint8
{
	LOW       UMETA(DisplayName = "Low"),
	MEDIUM    UMETA(DisplayName = "Medium"),
	HIGH      UMETA(DisplayName = "High"),
	CRITICAL  UMETA(DisplayName = "Critical")
};

// Event Dispatcher Declaration
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnScareEventTriggered, EParanormalSeverity, Severity);

UCLASS( ClassGroup=(Custom), meta=(BlueprintSpawnableComponent) )
class TYKUTE_API UBPC_FearDirector : public UActorComponent
{
	GENERATED_BODY()

public:	
	// Sets default values for this component's properties
	UBPC_FearDirector();

protected:
	// Called when the game starts
	virtual void BeginPlay() override;

public:	
	// Event Dispatcher triggered when a scare event is evaluated
	UPROPERTY(BlueprintAssignable, Category = "Fear Director")
	FOnScareEventTriggered OnScareEventTriggered;

	// Increments player stress instantly (useful for puzzle failure or sudden jumpscares)
	UFUNCTION(BlueprintCallable, Category = "Fear Director")
	void AddStressInstant(float Amount);

	// Getters and Setters
	UFUNCTION(BlueprintPure, Category = "Fear Director")
	float GetPlayerStress() const { return PlayerStress; }

	UFUNCTION(BlueprintCallable, Category = "Fear Director")
	void SetIsInDarkness(bool bInDarkness) { bIsInDarkness = bInDarkness; }

private:
	// Core Stress Evaluator loop run every 1 second via Timer
	void EvaluateStressAndEvents();

	// Decides if a paranormal event should trigger based on Stress levels
	void EvaluateParanormalTrigger();

	// Clears the cooldown flag allowing new events to trigger
	void ClearCooldown();

	// Helper to calculate distance from player camera to the horror entity
	float GetDistanceToGhost() const;

private:
	// Current stress level (0.0 to 100.0)
	UPROPERTY(VisibleAnywhere, Category = "Fear Director|Variables")
	float PlayerStress;

	// Is the player standing in pitch dark?
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Fear Director|Variables", meta = (AllowPrivateAccess = "true"))
	bool bIsInDarkness;

	// Is the scare trigger system on cooldown?
	UPROPERTY(VisibleAnywhere, Category = "Fear Director|Variables")
	bool bCooldownActive;

	// Cooldown duration in seconds after a scare event is triggered
	UPROPERTY(EditAnywhere, Category = "Fear Director|Variables")
	float CooldownDuration;

	// Reference to the horror entity in the scene
	UPROPERTY(EditAnywhere, Category = "Fear Director|Variables")
	AActor* TargetEntityActor;

	// Timer Handle for periodic evaluation
	FTimerHandle DirectorTimerHandle;

	// Timer Handle for Cooldown restoration
	FTimerHandle CooldownTimerHandle;
};
