/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { format } from "date-fns";
import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Flatpickr = require("react-flatpickr").default;

type IDateTime = {
  field: any;
};

export const DateTime: React.FC<IDateTime> = ({ field }) => {
  return (
    <FormControl>
      <Flatpickr
        options={{
          enableTime: true,
          dateFormat: "Y-m-d H:i",
          time_24hr: true,
        }}
        value={field.value ? new Date(field.value) : ""}
        onChange={(dates: string | any[]) => {
          field.onChange(dates.length > 0 ? new Date(dates[0]) : undefined);
        }}
        render={(
          { defaultValue, value, ...props }: any,
          ref: React.LegacyRef<HTMLInputElement> | undefined
        ) => (
          <Input
            ref={ref}
            {...props}
            value={value ? format(new Date(value), "yyyy-MM-dd HH:mm") : ""}
            onChange={(dates: string | any[]) => {
              field.onChange(dates.length > 0 ? new Date(dates[0]) : undefined);
            }}
            placeholder="yyyy-MM-dd HH:mm"
            defaultValue={defaultValue}
          />
        )}
      />
    </FormControl>
  );
};
