from enum import Enum

class TicketState(str, Enum):
    BACKLOG = "backlog"
    INPROGRESS = "inprogress"
    REVIEW = "review"
    FINISHED = "finished"