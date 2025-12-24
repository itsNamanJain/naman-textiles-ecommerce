"use client";

import { MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/motion";

export default function AddressesPage() {
  // TODO: Implement addresses CRUD with tRPC

  return (
    <FadeIn>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Saved Addresses
              </CardTitle>
              <CardDescription className="mt-1">
                Manage your shipping addresses
              </CardDescription>
            </div>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No addresses saved
            </h3>
            <p className="mt-1 text-gray-500">
              Add an address to make checkout faster
            </p>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
