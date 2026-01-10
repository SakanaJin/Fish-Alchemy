//api types ------------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
  errors: ApiError[];
  has_errors: boolean;
}

export interface ApiError {
  property: string;
  message: string;
}

//user types --------------------------------------------------------------------------------

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface UserGetDto {
  id: number;
  username: string;
  pfp_path: string;
  banner_path: string;
  groups: GroupShallowDto[];
  tickets: TicketShallowDto[];
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface UserCreateDto {
  username: string;
  email: string;
  password: string;
}

export interface UserUpdateDto {
  username: string;
}

export interface UserShallowDto {
  id: number;
  username: string;
  pfp_path: string;
  banner_path: string;
}

//Group types ----------------------------------------------------------------------------------

export interface GroupGetDto {
  id: number;
  name: string;
  logo_path: string;
  banner_path: string;
  creator: UserShallowDto;
  users: UserShallowDto[];
  projects: ProjectShallowDto[];
}

export interface GroupCreateDto {
  name: string;
}

export interface GroupUpdateDto {
  name: string;
}

export interface GroupShallowDto {
  id: number;
  name: string;
  logo_path: string;
  creatorid: number;
}

//project types ---------------------------------------------------------------------------------

export interface ProjectGetDto {
  id: number;
  name: string;
  description: string;
  lead: UserShallowDto;
  ticket_count: number;
  discord_webhook_url: string;
  github_url: string;
  logo_path: string;
  banner_path: string;
  group: GroupShallowDto;
  tickets: TicketShallowDto[];
  graphs: GraphShallowDto[];
}

export interface ProjectCreateDto {
  name: string;
  description: string;
  discord_webhook_url: string;
  github_url: string;
}

export interface ProjectUpdateDto {
  name: string;
  description: string;
  discord_webhook_url: string;
  github_url: string;
}

export interface ProjectShallowDto {
  id: number;
  name: string;
  logo_path: string;
  lead: UserShallowDto;
}

//ticket types -------------------------------------------------------------------------------------

export enum TicketState {
  BACKLOG = "backlog",
  INPROGRESS = "inprogress",
  REVIEW = "review",
  FINISHED = "finished",
}

export interface TicketGetDto {
  id: number;
  name: string;
  description: string;
  ticketnum: number;
  state: TicketState;
  github_url: string;
  created_at: string;
  duedate: string;
  user: UserShallowDto;
  project: ProjectShallowDto;
}

export interface TicketCreateDto {
  name: string;
  description: string;
  github_url: string;
}

export interface TicketUpdateDto {
  name: string;
  description: string;
  github_url: string;
}

export interface TicketStateDto {
  state: TicketState;
}

export interface TicketDateDto {
  date: string;
}

export interface TicketShallowDto {
  id: number;
  name: string;
  description: string;
  ticketnum: number;
  state: TicketState;
  github_url: string;
  created_at: string;
  duedate: string;
  projectid: number;
  projectname: string;
  user: UserShallowDto;
}

//Graph Types ---------------------------------------------------------------------------------------

export interface GraphGetDto {
  id: number;
  name: string;
  description: string;
  project: ProjectShallowDto;
  nodes: NodeShallowDto[];
}

export interface GraphCreateDto {
  name: string;
  description: string;
}

export interface GraphUpdateDto {
  name: string;
  description: string;
}

export interface GraphShallowDto {
  id: number;
  name: string;
}

//Node Types ---------------------------------------------------------------------------------------------------

export interface NodeGetDto {
  id: number;
  name: string;
  description: string;
  graph: GraphShallowDto;
  dependencies: NodeShallowDto[];
}

export interface NodeCreateDto {
  name: string;
  description: string;
}

export interface NodeUpdateDto {
  name: string;
  description: string;
}

export interface NodeShallowDto {
  id: number;
  name: string;
}

//Misc -------------------------------------------------------------------------------------------------------------

export interface ColumnType {
  id: string;
  title: string;
  state: TicketState;
  tickets: TicketShallowDto[];
}
