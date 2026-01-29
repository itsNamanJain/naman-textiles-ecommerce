"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MapPin, Plus, Edit, Trash2, Loader2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const addressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Enter a valid pincode"),
  isDefault: z.boolean().default(false),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function AddressesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const utils = api.useUtils();
  const { data: addresses, isLoading } = api.address.getAll.useQuery();

  const createMutation = api.address.create.useMutation({
    onSuccess: () => {
      toast.success("Address added");
      utils.address.getAll.invalidate();
      setDialogOpen(false);
      setEditingAddressId(null);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add address");
    },
  });

  const updateMutation = api.address.update.useMutation({
    onSuccess: () => {
      toast.success("Address updated");
      utils.address.getAll.invalidate();
      setDialogOpen(false);
      setEditingAddressId(null);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update address");
    },
  });

  const deleteMutation = api.address.delete.useMutation({
    onSuccess: () => {
      toast.success("Address deleted");
      utils.address.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete address");
    },
  });

  const setDefaultMutation = api.address.setDefault.useMutation({
    onSuccess: () => {
      toast.success("Default address updated");
      utils.address.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to set default address");
    },
  });

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    },
  });

  const openCreateDialog = () => {
    setEditingAddressId(null);
    form.reset({
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (address: NonNullable<typeof addresses>[0]) => {
    setEditingAddressId(address.id);
    form.reset({
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: AddressFormData) => {
    if (editingAddressId) {
      updateMutation.mutate({
        id: editingAddressId,
        data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const addressList = addresses ?? [];

  return (
    <FadeIn>
      <Card className="border border-black/5 bg-white/80">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-display text-ink-1 flex items-center gap-2 text-xl">
                <MapPin className="h-5 w-5" />
                Saved Addresses
              </CardTitle>
              <CardDescription className="text-muted-1 mt-1">
                Manage your shipping addresses
              </CardDescription>
            </div>
            <Button
              className="bg-brand-1 hover:bg-brand-2 rounded-full"
              onClick={openCreateDialog}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-brand-1 h-8 w-8 animate-spin" />
            </div>
          ) : addressList.length === 0 ? (
            <div className="py-16 text-center">
              <div className="bg-paper-1 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <MapPin className="text-muted-3 h-8 w-8" />
              </div>
              <h3 className="font-display text-ink-1 text-lg">
                No addresses saved
              </h3>
              <p className="text-muted-1 mt-1">
                Add an address to make checkout faster
              </p>
            </div>
          ) : (
            <StaggerContainer className="grid gap-4 sm:grid-cols-2">
              {addressList.map((address) => (
                <StaggerItem key={address.id}>
                  <div className="rounded-2xl border border-black/5 bg-white/80 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-ink-1 font-medium">
                            {address.name}
                          </p>
                          {address.isDefault && (
                            <span className="bg-paper-1 text-brand-3 rounded-full px-2 py-0.5 text-xs font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-muted-1 mt-1 text-sm">
                          {address.addressLine1}
                          {address.addressLine2
                            ? `, ${address.addressLine2}`
                            : ""}
                        </p>
                        <p className="text-muted-1 text-sm">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p className="text-muted-2 mt-1 text-sm">
                          +91 {address.phone}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!address.isDefault && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-black/10"
                            onClick={() =>
                              setDefaultMutation.mutate({ id: address.id })
                            }
                            title="Set default"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border-black/10"
                          onClick={() => openEditDialog(address)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-danger-1 hover:text-danger-2 h-8 w-8 rounded-full border-black/10"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Address
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this address?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteMutation.mutate({ id: address.id })
                                }
                                className="bg-danger-1 hover:bg-danger-2"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-ink-1 text-xl">
              {editingAddressId ? "Edit Address" : "Add Address"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          className="rounded-2xl border-black/10 bg-white/80"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="9876543210"
                          inputMode="numeric"
                          maxLength={10}
                          className="rounded-2xl border-black/10 bg-white/80"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="House/Flat No., Building Name"
                        className="rounded-2xl border-black/10 bg-white/80"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Street, Landmark"
                        className="rounded-2xl border-black/10 bg-white/80"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Delhi"
                          className="rounded-2xl border-black/10 bg-white/80"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Delhi"
                          className="rounded-2xl border-black/10 bg-white/80"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="110031"
                          inputMode="numeric"
                          maxLength={6}
                          className="rounded-2xl border-black/10 bg-white/80"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/80 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-ink-1">
                        Set as default
                      </FormLabel>
                      <p className="text-muted-1 text-sm">
                        Use this address by default at checkout
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="text-ink-1 rounded-full border-black/10 bg-white/80 hover:bg-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-1 hover:bg-brand-2 rounded-full"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {editingAddressId ? "Update Address" : "Add Address"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
