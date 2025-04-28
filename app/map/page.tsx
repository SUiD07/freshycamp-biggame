"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import React from "react";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { signInAction } from "../actions";
import { Button } from "@/components/ui/button";

export default function map() {
  const supabase = createClient();
  const [users, setUsers] = useState<any>([]);
  const fetchUser = async () => {
    let { data, error } = await supabase.from("nodes").select("*");

    if (!data || error) {
      console.log("error", error);
    }
    setUsers(data);
  };
  useEffect(() => {
    fetchUser();
  }, []);
  return (
    <>
      <div className="text-center">map</div>
      <div className="flex gap-2 [&>input]:mb-3 mt-8">
        {/* <Label htmlFor="search" className="">Search</Label> */}
        <Input name="search" placeholder="search" required />
        <Button>Search</Button>
      </div>
      <main>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Top</th>
              <th>Left</th>
              <th>Value</th>
              <th>SElected car</th>
              <th>tower</th>
              <th>ship</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr>
                <td>{user.id}</td>
                <td>{user.top}</td>
                <td>{user.left}</td>
                <td>{user.value}</td>
                <td>{user.selectedCar}</td>
                <td>{user.tower ? "Yes" : "No"}</td>
                <td>{JSON.stringify(user.ship)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      {/* <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Submit
        </SubmitButton>
      </div> */}
    </>
  );
}
