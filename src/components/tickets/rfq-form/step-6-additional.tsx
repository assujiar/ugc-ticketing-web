"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, File, Truck } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { RFQFormData } from "@/types/forms";

interface Step6Props {
  form: UseFormReturn<RFQFormData>;
}

const FLEET_OPTIONS = [
  { value: "blindvan", label: "Blind Van" },
  { value: "cde_bak", label: "CDE Bak" },
  { value: "cde_box", label: "CDE Box" },
  { value: "cde_reefer", label: "CDE Reefer" },
  { value: "cdd_bak", label: "CDD Bak" },
  { value: "cdd_box", label: "CDD Box" },
  { value: "cdd_long", label: "CDD Long" },
  { value: "cdd_reefer", label: "CDD Reefer" },
  { value: "fuso_bak", label: "Fuso Bak" },
  { value: "fuso_box", label: "Fuso Box" },
  { value: "tronton_wingbox", label: "Tronton Wingbox" },
  { value: "tronton_pickup", label: "Tronton Pickup" },
  { value: "trailer_20ft", label: "Trailer 20 Feet" },
  { value: "trailer_40ft", label: "Trailer 40 Feet" },
  { value: "trailer_flatbed", label: "Trailer Flatbed" },
  { value: "other", label: "Lainnya" },
];

export function Step6Additional({ form }: Step6Props) {
  const { register, formState: { errors }, setValue, watch } = form;
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFleets, setSelectedFleets] = useState<string[]>([]);
  const [fleetQuantities, setFleetQuantities] = useState<Record<string, number>>({});

  const handleFleetToggle = (fleetValue: string, checked: boolean) => {
    let newSelected: string[];
    if (checked) {
      newSelected = [...selectedFleets, fleetValue];
      setFleetQuantities(prev => ({ ...prev, [fleetValue]: 1 }));
    } else {
      newSelected = selectedFleets.filter(f => f !== fleetValue);
      const newQuantities = { ...fleetQuantities };
      delete newQuantities[fleetValue];
      setFleetQuantities(newQuantities);
    }
    setSelectedFleets(newSelected);
    
    // Update form value
    const fleetData = newSelected.map(f => ({
      type: f,
      label: FLEET_OPTIONS.find(opt => opt.value === f)?.label || f,
      quantity: checked ? (fleetQuantities[f] || 1) : fleetQuantities[f],
    }));
    setValue("fleet_requirement", JSON.stringify(fleetData));
  };

  const handleQuantityChange = (fleetValue: string, quantity: number) => {
    const newQuantities = { ...fleetQuantities, [fleetValue]: quantity };
    setFleetQuantities(newQuantities);
    
    // Update form value
    const fleetData = selectedFleets.map(f => ({
      type: f,
      label: FLEET_OPTIONS.find(opt => opt.value === f)?.label || f,
      quantity: newQuantities[f] || 1,
    }));
    setValue("fleet_requirement", JSON.stringify(fleetData));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max 5MB.`);
        return false;
      }
      return true;
    }).slice(0, 5 - files.length);

    const newFiles = [...files, ...validFiles];
    setFiles(newFiles);

    validFiles.forEach(file => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviews(prev => [...prev, ""]);
      }
    });

    setValue("attachments" as any, newFiles.map(f => f.name));
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    setValue("attachments" as any, newFiles.map(f => f.name));
  };

  // Expose files for parent form
  (window as any).__rfqFiles = files;

  return (
    <div className="space-y-6">
      {/* Fleet Requirement */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Fleet Requirement
        </Label>
        <p className="text-sm text-white/60">Pilih jenis armada yang dibutuhkan</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
          {FLEET_OPTIONS.map((fleet) => (
            <div
              key={fleet.value}
              className={`flex flex-col p-3 rounded-lg border transition-colors ${
                selectedFleets.includes(fleet.value)
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-white/20 bg-white/5 hover:border-white/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  id={fleet.value}
                  checked={selectedFleets.includes(fleet.value)}
                  onCheckedChange={(checked) => handleFleetToggle(fleet.value, checked as boolean)}
                />
                <label
                  htmlFor={fleet.value}
                  className="text-sm cursor-pointer flex-1"
                >
                  {fleet.label}
                </label>
              </div>
              
              {selectedFleets.includes(fleet.value) && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-white/60">Qty:</span>
                  <Input
                    type="number"
                    min={1}
                    value={fleetQuantities[fleet.value] || 1}
                    onChange={(e) => handleQuantityChange(fleet.value, parseInt(e.target.value) || 1)}
                    className="h-7 w-16 text-sm bg-white/10 border-white/20"
                  />
                  <span className="text-xs text-white/60">unit</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedFleets.length > 0 && (
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-sm font-medium mb-2">Selected Fleet:</p>
            <div className="flex flex-wrap gap-2">
              {selectedFleets.map(f => {
                const fleet = FLEET_OPTIONS.find(opt => opt.value === f);
                return (
                  <span
                    key={f}
                    className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs"
                  >
                    {fleet?.label} x {fleetQuantities[f] || 1}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="scope_of_work">Scope of Work *</Label>
        <Textarea
          id="scope_of_work"
          {...register("scope_of_work")}
          placeholder="Describe the required services in detail"
          rows={4}
          className="bg-white/5 border-white/20"
        />
        {errors.scope_of_work && (
          <p className="text-sm text-red-400">{errors.scope_of_work.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional_notes">Additional Notes</Label>
        <Textarea
          id="additional_notes"
          {...register("additional_notes")}
          placeholder="Any other information or special requirements"
          rows={3}
          className="bg-white/5 border-white/20"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="estimated_project_date">Estimated Project Date</Label>
        <Input
          id="estimated_project_date"
          type="date"
          {...register("estimated_project_date")}
          className="bg-white/5 border-white/20"
        />
      </div>

      {/* File Upload Section */}
      <div className="space-y-3">
        <Label>Attachments (Photos/Documents)</Label>
        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-orange-500/50 transition-colors">
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="h-10 w-10 mx-auto text-white/40 mb-2" />
            <p className="text-sm text-white/60">Click to upload or drag and drop</p>
            <p className="text-xs text-white/40 mt-1">
              Images, PDF, Word, Excel (max 5MB each, up to 5 files)
            </p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative bg-white/5 rounded-lg p-3 border border-white/10"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 hover:bg-red-600 rounded-full"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>

                {previews[index] ? (
                  <img
                    src={previews[index]}
                    alt={file.name}
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                ) : (
                  <div className="w-full h-20 flex items-center justify-center bg-white/5 rounded mb-2">
                    <File className="h-8 w-8 text-white/40" />
                  </div>
                )}
                <p className="text-xs text-white/60 truncate">{file.name}</p>
                <p className="text-xs text-white/40">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
