"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createHouseholdAction,
  getHouseholdsAction,
} from "@/actions/household";
import {
  CreateHouseholdModal,
  // EditHouseholdModal,
} from "@/components/household/houseHoldModal";
import { Badge } from "@/components/ui/badge";

const NoHouseholds = () => {
  return (
    <div className="text-gray-700">
      <p className="text-sm text-gray-500">
        You don't have any households yet. Create your first household to get
        started.
      </p>
    </div>
  );
};

const HouseholdsList = () => {
  const [loading, setLoading] = useState(true);
  const [households, setHouseholds] = useState<any[] | null>(null);
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getHouseholdsAction()
      .then((res) => {
        if (!mounted) return;
        if (!res.ok) {
          setError(res.error ?? { title: "Unknown error" });
          setHouseholds(null);
          return;
        }

        if (!("data" in res) || !Array.isArray(res.data)) {
          setHouseholds([]);
          return;
        }

        setHouseholds(res.data);
      })
      .catch((e) => {
        if (!mounted) return;
        setError({ title: String(e) });
        setHouseholds(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <>
        {Array.from({ length: 1 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between"
            aria-hidden="true">
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="h-10 bg-gray-200 rounded-full w-2/3 animate-pulse" />
              <div className="ml-3 h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (!households || households.length === 0) {
    if (error && error?.status === 404) {
      return <NoHouseholds />;
    }
    if (error) {
      return (
        <div className="text-red-600">
          Failed to load households: {String(error?.title ?? "Unknown error")}
        </div>
      );
    }
    return <NoHouseholds />;
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {households.length > 0 ? (
        households.map((h) => (
          <div
            key={h.householdId}
            className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <h3 className="text-2xl font-extrabold mb-3 text-blue-800">
                {h.householdName}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{h.householdId}</p>
              <Badge
                variant="secondary"
                className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-600 border border-blue-300 shadow-sm">
                {h.role ?? "Unknown"}
              </Badge>
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500">No households found.</div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Content */}
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Your Households</h2>
        <div
          role="status"
          aria-live="polite"
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Suspense
            fallback={
              <div
                className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between"
                aria-hidden="true">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="h-10 bg-gray-200 rounded-full w-2/3 animate-pulse" />
                  <div className="ml-3 h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                </div>
              </div>
            }>
            {/* This will render/loading on the client */}
            <HouseholdsList />
          </Suspense>

          {/* Floating Action Button */}
          <CreateHouseholdModal
            onCreate={async (name: string) => {
              try {
                await createHouseholdAction({ Name: name });
              } catch (e) {
                console.error("Failed to create household", e);
              } finally {
                setIsCreateModalOpen(false);
                router.refresh();
              }
            }}
            open={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-700 transition"
            aria-label="Create household">
            +
          </button>
        </div>
      </div>
    </div>
  );
}
