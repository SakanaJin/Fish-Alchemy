from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from Fish_Alchemy_Data.database import get_db
from Fish_Alchemy_Data.Common.Response import Response, HttpException

from Fish_Alchemy_Data.Entities.Tickets import Ticket, TicketCreateDto, TicketUpdateDto, TicketStateDto, TicketDateDto
from Fish_Alchemy_Data.Common.TicketState import TicketState
from Fish_Alchemy_Data.Common.Payload import Payload, send_discord_message
from Fish_Alchemy_Data.Entities.Projects import Project
from Fish_Alchemy_Data.Entities.Users import User
from Fish_Alchemy_Data.Controllers.AuthController import get_current_user

router = APIRouter(prefix="/api/tickets", tags=['Tickets'])

state_strings = {TicketState.BACKLOG.name: "To Do", TicketState.INPROGRESS.name: "In Progress", TicketState.REVIEW.name: "In Review", TicketState.FINISHED.name: "Finished"}

@router.get("/")
def get_all(db: Session = Depends(get_db)):
    response = Response()
    tickets = db.query(Ticket).all()
    response.data = [ticket.toGetDto() for ticket in tickets]
    return response

@router.get("/{id}")
def get_by_id(id: int, db: Session = Depends(get_db)):
    response = Response()
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        response.add_error("id", "ticket not found")
        raise HttpException(status_code=404, response=response)
    response.data = ticket.toGetDto()
    return response

@router.post("/project/{projectid}")
def create(ticketdto: TicketCreateDto, projectid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    response = Response()
    project = db.query(Project).filter(Project.id == projectid).first()
    if not project:
        response.add_error("projectid", "project not found")
        raise HttpException(status_code=404, response=response)
    if project.lead_id != user.id:
        response.add_error("user", "only lead can create tickets")
        raise HttpException(status_code=400, response=response)
    if len(ticketdto.name) == 0:
        response.add_error("name", "name cannot be empty")
        raise HttpException(status_code=400, response=response)
    project.ticket_count += 1
    ticket = Ticket(
        name=ticketdto.name,
        description=ticketdto.description,
        github_url=ticketdto.github_url,
        ticketnum=project.ticket_count,
        user=user,
        project=project,
        created_at=datetime.now(),
        duedate=datetime.now() + timedelta(weeks=1)
    )
    db.add(ticket)
    db.commit()
    response.data = ticket.toGetDto()
    try:
        payload = Payload(
            username=project.name,
            title=f'[#{ticket.ticketnum}] {ticket.name}',
            description="Ticket created",
            color=0x14c744
        )
        send_discord_message(ticket.project.discord_webhook_url, payload.to_json())
    finally:
        return response

@router.patch("/{id}")
def update(ticketdto: TicketUpdateDto, id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    response = Response()
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        response.add_error("id", "ticket not found")
        raise HttpException(status_code=404, response=response)
    if ticket.project.lead_id != user.id:
        response.add_error("user", "only lead can edit ticket")
        raise HttpException(status_code=400, response=response)
    if len(ticketdto.name) == 0:
        response.add_error("name", "name cannot be empty")
        raise HttpException(status_code=400, response=response)
    ticket.name = ticketdto.name
    ticket.description = ticketdto.description
    ticket.github_url = ticketdto.github_url
    db.commit()
    response.data = ticket.toGetDto()
    return response

@router.patch("/{id}/state")
def change_state(dto: TicketStateDto, id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    response = Response()
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        response.add_error("id", "ticket not found")
        raise HttpException(status_code=404, response=response)
    if user.id != ticket.project.lead_id and user.id != ticket.user_id:
        response.add_error("user", "only lead or assigned user can change ticket state")
        raise HttpException(status_code=400, response=response)
    if dto.state not in TicketState:
        response.add_error("state", "ivalid ticket state")
        raise HttpException(status_code=400, response=response)
    ticket.state = dto.state
    db.commit()
    response.data = ticket.toGetDto()
    try: 
        payload = Payload(
            username=ticket.project.name,
            title=f'[#{ticket.ticketnum}] {ticket.name}', 
            description=f'Changed state to "{state_strings[ticket.state.name]}"',
            color=0x068067,
        )
        send_discord_message(ticket.project.discord_webhook_url, payload.to_json())
    finally: 
        return response

@router.patch("/{id}/duedate")
def change_duedate(dto: TicketDateDto, id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    response = Response()
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        response.add_error("id", "ticket not found")
        raise HttpException(status_code=404, response=response)
    if ticket.project.lead_id != user.id:
        response.add_error("user", "only lead can change due date")
        raise HttpException(status_code=400, response=response)
    try:
        date = datetime.fromisoformat(dto.date)
    except ValueError:
        response.add_error("date", "invalid date format")
        raise HttpException(status_code=400, response=response)
    if date <= datetime.now():
        response.add_error("date", "invalid date")
        raise HttpException(status_code=400, response=response)
    ticket.duedate = date
    db.commit()
    response.data = ticket.toGetDto()
    try:
        payload = Payload(
            username=ticket.project.name,
            title=f'[#{ticket.ticketnum}] {ticket.name}',
            description=f'Changed duedate to {ticket.duedate}',
            color=0x7217e8
        )
        send_discord_message(ticket.project.discord_webhook_url, payload.to_json())
    finally:
        return response

@router.patch("/{ticketid}/user/{userid}")
def assign_user(ticketid: int, userid: int, db: Session = Depends(get_db), authedUser: User = Depends(get_current_user)):
    response = Response()
    ticket = db.query(Ticket).filter(Ticket.id == ticketid).first()
    user = db.query(User).filter(User.id == userid).first()
    if authedUser.id != ticket.project.lead.id:
        response.add_error("auth", "only lead can assign user")
    if not ticket:
        response.add_error("id", "ticket not found")
    if not user:
        response.add_error("id", "user not found")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    ticket.user = user
    db.commit()
    response.data = ticket.toGetDto()
    try:
        payload = Payload(
            username=ticket.project.name,
            title=f'[#{ticket.ticketnum}] {ticket.name}',
            description=f'Ticket assigned to {ticket.user.username}',
            color=0xfcb632
        )
        send_discord_message(ticket.project.discord_webhook_url, payload.to_json())
    finally:
        return response

@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    response = Response()
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        response.add_error("id", "ticket not found")
        raise HttpException(status_code=404, response=response)
    if ticket.project.lead_id != user.id:
        response.add_error("user", "only lead can delete ticket")
        raise HttpException(status_code=400, response=response)
    db.delete(ticket)
    db.commit()
    response.data = True
    try:
        payload = Payload(
            username=ticket.project.name,
            title=f'[#{ticket.ticketnum}] {ticket.name}',
            description="Ticket deleted",
            color=0xF44336
        )
        send_discord_message(ticket.project.discord_webhook_url, payload.to_json())
    finally:
        return response