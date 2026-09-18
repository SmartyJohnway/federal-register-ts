
export interface FilterOption {
  value: string;
  count: number;
}

export interface Filter {
  name: string;
  type: string;
  options: FilterOption[];
}

export interface Suggestion {
  text: string;
  url: string;
}

