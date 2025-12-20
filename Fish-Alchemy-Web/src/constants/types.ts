//api types ------------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
  errors: ApiError[];
  hasErrors: boolean;
}

export interface ApiError {
  property: string;
  message: string;
}

//user types --------------------------------------------------------------------------------

export interface UserGetDto {
  id: number;
  username: string;
  pfp_path: string;
  banner_path: string;
  groups: any[]; //GroupShallowDto[]
  tickets: any[]; //TicketShallowDto[]
}
