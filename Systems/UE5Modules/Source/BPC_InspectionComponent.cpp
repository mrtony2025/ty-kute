// Fill out your copyright notice in the Description page of Project Settings.

#include "BPC_InspectionComponent.h"
#include "Kismet/GameplayStatics.h"
#include "GameFramework/Character.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/PlayerController.h"
#include "Camera/PlayerCameraManager.h"
#include "Engine/World.h"
#include "DrawDebugHelpers.h"

// Sets default values for this component's properties
UBPC_InspectionComponent::UBPC_InspectionComponent()
{
	PrimaryComponentTick.bCanEverTick = false;

	bIsInspecting = false;
	InspectedActor = nullptr;
	RotationSpeed = 2.0f;
	InspectionDistance = 60.0f;
}

// Called when the game starts
void UBPC_InspectionComponent::BeginPlay()
{
	Super::BeginPlay();
}

// Enters 3D inspection view
void UBPC_InspectionComponent::StartInspection(AActor* TargetActor)
{
	if (bIsInspecting || !TargetActor)
	{
		return;
	}

	bIsInspecting = true;
	InspectedActor = TargetActor;
	OriginalTransform = TargetActor->GetActorTransform();

	APlayerController* PC = UGameplayStatics::GetPlayerController(GetWorld(), 0);
	if (PC)
	{
		ACharacter* PlayerChar = Cast<ACharacter>(PC->GetPawn());
		if (PlayerChar)
		{
			// 1. Disable player movement
			UCharacterMovementComponent* MoveComp = PlayerChar->GetCharacterMovement();
			if (MoveComp)
			{
				MoveComp->DisableMovement();
			}
		}

		// 2. Set input mode to support mouse interaction
		FInputModeGameAndUI InputMode;
		InputMode.SetLockMouseToViewportBehavior(EMouseLockMode::DoNotLock);
		InputMode.SetHideCursorDuringCapture(false);
		PC->SetInputMode(InputMode);
		PC->bShowMouseCursor = false;
	}

	// 3. Move inspected actor smoothly in front of the camera
	APlayerCameraManager* CameraManager = UGameplayStatics::GetPlayerCameraManager(GetWorld(), 0);
	if (CameraManager)
	{
		FVector TargetLocation = CameraManager->GetCameraLocation() + (CameraManager->GetActorForwardVector() * InspectionDistance);
		FRotator TargetRotation = CameraManager->GetCameraRotation();
		
		// Detach from physics/environment temporarily to prevent collision glitch
		InspectedActor->SetActorEnableCollision(false);
		
		InspectedActor->SetActorLocationAndRotation(TargetLocation, TargetRotation);
	}
}

// Rotates the inspected object based on mouse axis inputs
void UBPC_InspectionComponent::RotateObject(float AxisX, float AxisY)
{
	if (!bIsInspecting || !InspectedActor)
	{
		return;
	}

	APlayerCameraManager* CameraManager = UGameplayStatics::GetPlayerCameraManager(GetWorld(), 0);
	if (CameraManager)
	{
		FVector CameraRight = CameraManager->GetActorRightVector();
		FVector CameraUp = CameraManager->GetActorUpVector();

		// Add local rotation using camera coordinates as pivot axes
		InspectedActor->AddActorWorldRotation(FRotator(AxisY * RotationSpeed, -AxisX * RotationSpeed, 0.0f));

		// Check if player rotated the object to expose hidden clue hotspots
		CheckClueHotspot();
	}
}

// Performs a raycast to find hidden hotspots on the mesh
void UBPC_InspectionComponent::CheckClueHotspot()
{
	APlayerCameraManager* CameraManager = UGameplayStatics::GetPlayerCameraManager(GetWorld(), 0);
	if (!CameraManager) return;

	FVector Start = CameraManager->GetCameraLocation();
	FVector End = Start + (CameraManager->GetActorForwardVector() * (InspectionDistance + 30.0f));

	FHitResult HitResult;
	FCollisionQueryParams Params;
	Params.AddIgnoredActor(GetOwner());
	
	// Perform LineTrace looking for "Hotspot" tag or specific custom collision profiles
	if (GetWorld()->LineTraceSingleByChannel(HitResult, Start, End, ECC_Visibility, Params))
	{
		AActor* HitActor = HitResult.GetActor();
		if (HitActor && HitResult.Component.IsValid())
		{
			// Check if we hit a specific component marked with Clue tags
			if (HitResult.Component->ComponentHasTag(FName("ClueHotspot")))
			{
				// Retrieve the Clue ID dynamically from component metadata
				// For prototype simplicity, we read the component name or a custom parameter
				FName DiscoveredClueID = FName(*HitResult.Component->GetName());
				OnClueDiscovered.Broadcast(DiscoveredClueID);
			}
		}
	}
}

// Exits inspection mode
void UBPC_InspectionComponent::StopInspection()
{
	if (!bIsInspecting || !InspectedActor)
	{
		return;
	}

	// Restore original transform and physics state
	InspectedActor->SetActorTransform(OriginalTransform);
	InspectedActor->SetActorEnableCollision(true);

	APlayerController* PC = UGameplayStatics::GetPlayerController(GetWorld(), 0);
	if (PC)
	{
		ACharacter* PlayerChar = Cast<ACharacter>(PC->GetPawn());
		if (PlayerChar)
		{
			UCharacterMovementComponent* MoveComp = PlayerChar->GetCharacterMovement();
			if (MoveComp)
			{
				MoveComp->SetMovementMode(MOVE_Walking);
			}
		}

		// Restore standard input mode
		FInputModeGameOnly InputMode;
		PC->SetInputMode(InputMode);
		PC->bShowMouseCursor = false;
	}

	bIsInspecting = false;
	InspectedActor = nullptr;
}
