export const STDLIB: Record<string, { sig: string; doc: string }> = {
  len: { sig: "len(value)", doc: "Length of the value, 0 if not applicable" },
  clamp: {
    sig: "clamp(number, lo, hi)",
    doc: "Clamp the value between x and y",
  },
  sum: {
    sig: "sum(array)",
    doc: "Sum all the elements of the array, non number elements are ignored",
  },
  min: {
    sig: "min(array)",
    doc: "Get min element in array, non number elements are ignored",
  },
  max: {
    sig: "max(array)",
    doc: "Get max element in array, non number elements are ignored",
  },
  pluck: {
    sig: "pluck(array, key)",
    doc: "Create a new array from indexing into every element object",
  },
  log_10: { sig: "log_10(number)", doc: "Calculate log 10 of the number" },
  to_uppercase: {
    sig: "to_uppercase(string)",
    doc: "Convert string to uppercase",
  },
  to_lowercase: {
    sig: "to_lowercase(string)",
    doc: "Convert string to lowercase",
  },
  blank_as_null: {
    sig: "blank_as_null(value)",
    doc: "Convert any blank value to null",
  },
  blank_as_void: {
    sig: "blank_as_void(value)",
    doc: "Convert any blank value to void",
  },
  concat: {
    sig: "concat(array)",
    doc: "Concatenate an array of values into a string",
  },
  join: {
    sig: "join(array, separator)",
    doc: "Concatenate an array of values into a string using a separator",
  },
  trim: {
    sig: "trim(string)",
    doc: "Returns a string with leading and trailing whitespace removed",
  },
  trim_end: {
    sig: "trim_end(string)",
    doc: "Returns a string slice with trailing whitespace removed",
  },
  trim_start: {
    sig: "trim_start(string)",
    doc: "Returns a string slice with leading whitespace removed",
  },
  void_as_null: {
    sig: "void_as_null(value)",
    doc: "Convert void value to null, used to emit explicit nulls",
  },
  to_i: { sig: "to_i(number)", doc: "Convert number to integer" },
  to_f: { sig: "to_f(number)", doc: "Convert number to float" },
  to_s: {
    sig: "to_s(value)",
    doc: "Convert any value to string representation",
  },
  map: { sig: "map(array, |x| ...)", doc: "Map elements of an array" },
  filter_map: {
    sig: "filter_map(array, |x| ...)",
    doc: "Filter and transform elements in the array",
  },
  filter: {
    sig: "filter(array, |x| ...)",
    doc: "Filter elements of the array",
  },
};
