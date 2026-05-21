// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal"
#include "Components/ActorComponent.h"
#include "BPC_InspectionComponent.generated.h"

// Dispatcher triggered when a raycast hits a hidden clue hotspot
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnClueDiscovered, FName, ClueID);

UCLASS( ClassGroup=(Custom), meta=(BlueprintSpawnableComponent) )
class TYKUTE_API UBPC_InspectionComponent : public UActorComponent
{
	GENERATED_BODY()

public:	
	// Sets default values for this component's properties
	UBPC_InspectionComponent();

protected:
	// Called when the game starts
	virtual void BeginPlay() override;

public:	
	// Triggers when players look directly at a hotspot on the 3D item
	UPROPERTY(BlueprintAssignable, Category = "Horror Inspection")
	FOnClueDiscovered OnClueDiscovered;

	// Enters 3D inspection view for a target actor
	UFUNCTION(BlueprintCallable, Category = "Horror Inspection")
	void StartInspection(AActor* TargetActor);

	// Exits inspection mode and returns the actor to its place
	UFUNCTION(BlueprintCallable, Category = "Horror Inspection")
	void StopInspection();

	// Rotates the inspected object based on mouse axes (called from player input)
	UFUNCTION(BlueprintCallable, Category = "Horror Inspection")
	void RotateObject(float AxisX, float AxisY);

	// Check getters
	UFUNCTION(BlueprintPure, Category = "Horror Inspection")
	bool IsInspecting() const { return bIsInspecting; }

private:
	// Performs line trace straight out from camera to detect "Hotspot_Clue" collisions
	void CheckClueHotspot();

private:
	// Current state
	UPROPERTY(VisibleAnywhere, Category = "Horror Inspection|Variables")
	bool bIsInspecting;

	// Reference to the currently inspected actor
	UPROPERTY(VisibleAnywhere, Category = "Horror Inspection|Variables")
	AActor* InspectedActor;

	// Storage for returning the actor back to its original placement
	UPROPERTY(VisibleAnywhere, Category = "Horror Inspection|Variables")
	FTransform OriginalTransform;

	// Mouse rotation speed modifier
	UPROPERTY(EditAnywhere, Category = "Horror Inspection|Variables")
	float RotationSpeed;

	// How far from player camera to anchor the inspected mesh
	UPROPERTY(EditAnywhere, Category = "Horror Inspection|Variables")
	float InspectionDistance;
};
