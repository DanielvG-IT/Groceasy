"use client";

import React, { useEffect, useState } from "react";
import { createHouseholdAction, getHouseholdAction } from "@/actions/household";
import { Household } from "@/types/household";
import { OperationResult } from "@/types/action";

const handleHousehold = async (): Promise<Household | null> => {
  try {
    const data: OperationResult<Household> = await getHouseholdAction();

    if ("error" in data && data.error) {
      if (data.error.status === 404) {
        // TODO: Give user modal to create or join a household
      }
      console.error("Household not found");
      return null;
    }

    if (!data.ok) {
      console.error("Failed to fetch household:", data.error);
      return null;
    }

    if ("data" in data) {
      return data.data;
    }

    console.error("Unexpected response format");
    return null;
  } catch (error) {
    console.error("An error occurred while fetching the household:", error);
    return null;
  }
};

const handleCreateHousehold = (
  name: string,
  setHouseholds: React.Dispatch<React.SetStateAction<Household | null>>
) => {
  createHouseholdAction({ Name: name })
    .then(async (result) => {
      if (result.ok && "data" in result) {
        const newHousehold = result.data;
        setHouseholds(newHousehold);
      } else {
        if (!result.ok && "error" in result) {
          console.error("Failed to create household:", result.error);
        }
      }
    })
    .catch((error) => {
      console.error("An error occurred while creating the household:", error);
    });
};

const AppPage = () => {
  const [households, setHouseholds] = useState<Household | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHousehold = async () => {
      setLoading(true);
      const data = await handleHousehold();
      setHouseholds(data);
      setLoading(false);
    };

    fetchHousehold();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!households) {
    return (
      <div>
        <p>No household data available.</p>
        <button
          onClick={() => handleCreateHousehold("New Household", setHouseholds)}>
          Create Household
        </button>
      </div>
    );
  }

  return <div>{JSON.stringify(households)}</div>;
};

export default AppPage;
