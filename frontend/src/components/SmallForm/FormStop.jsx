import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {StopMapView} from "@/pages/Manager/StopPage/StopMap/StopMap.jsx";

const formSchema = z.object({
    id: z.string().optional(),
    name: z.string().nonempty({ message: "Name is required." }),
    address: z.string().nonempty({ message: "Address is required." }),
    pointX: z
        .string()
        .regex(/^-?\d+(\.\d+)?$/, { message: "Point X must be a valid number." }),
    pointY: z
        .string()
        .regex(/^-?\d+(\.\d+)?$/, { message: "Point Y must be a valid number." }),
    isStation: z.enum(["true", "false"]),
});

const FormStop = ({
                      isAdd,
                      handleClose,
                      handleSubmit,
                      initialData,
                      showMap,
                      setShowMap,
                      onMapClick,
                      selectedStopCoordinates,
                  }) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: initialData?.id || "",
            name: initialData?.name || "",
            address: initialData?.address || "",
            pointX: initialData?.pointX || "",
            pointY: initialData?.pointY || "",
            isStation: initialData?.isStation || "false",
        },
    });

    const onSubmit = (data) => {
        handleSubmit(data);
    };

    const handleMapSelection = (locationData) => {
        if (locationData) {
            form.setValue("pointX", locationData.pointX);
            form.setValue("pointY", locationData.pointY);
            form.setValue("address", locationData.address);
        }
        onMapClick(locationData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="w-full max-w-4xl bg-white shadow-xl rounded-lg p-8 max-h-[90vh] overflow-y-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <h2 className="text-2xl font-bold text-center text-green-600">
                            {isAdd ? "Add New Stop" : "Edit Stop"}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* ID Field */}
                            <FormField
                                control={form.control}
                                name="id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stop ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter Stop ID" {...field} disabled={true} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Name Field */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Address Field */}
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Point X Field */}
                            <FormField
                                control={form.control}
                                name="pointX"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Point X (Longitude)</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={true}
                                                placeholder="Enter longitude"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Point Y Field */}
                            <FormField
                                control={form.control}
                                name="pointY"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Point Y (Latitude)</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={true}
                                                placeholder="Enter latitude"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Is Station Field */}
                            <FormField
                                control={form.control}
                                name="isStation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Is Station</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                className="w-full border border-gray-300 rounded-lg p-2"
                                            >
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Map Toggle Button */}
                        <div className="flex justify-center">
                            <Button
                                type="button"
                                onClick={() => setShowMap(!showMap)}
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                {showMap ? "Hide Map" : "Choose Location"}
                            </Button>
                        </div>

                        {/* Map View */}
                        {showMap && (
                            <div className="h-[400px] w-full border border-gray-300 rounded-lg overflow-hidden">
                                <StopMapView
                                    selectedStopCoordinates={selectedStopCoordinates}
                                    mode={isAdd ? "add" : "edit"}
                                    onMapClick={handleMapSelection}
                                />
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="w-[120px]"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="w-[120px] bg-green-600 hover:bg-green-700"
                            >
                                {isAdd ? "Add" : "Save"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default FormStop;