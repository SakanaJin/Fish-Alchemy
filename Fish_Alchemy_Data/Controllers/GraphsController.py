from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from Fish_Alchemy_Data.database import get_db
from Fish_Alchemy_Data.Common.Response import Response, HttpException

from Fish_Alchemy_Data.Entities.Graphs import Graph, GraphCreateDto, GraphUpdateDto
from Fish_Alchemy_Data.Entities.Projects import Project

router = APIRouter(prefix="/api/graphs", tags=['Graphs'])

@router.get("/")
def get_all(db: Session = Depends(get_db)):
    response = Response()
    graphs = db.query(Graph).all()
    response.data = [graph.toGetDto() for graph in graphs]
    return response

@router.get("/{id}")
def get_by_id(id: int, db: Session = Depends(get_db)):
    response = Response()
    graph = db.query(Graph).filter(Graph.id == id).first()
    if not graph:
        response.add_error("id", "graph not found")
        raise HttpException(status_code=404, response=response)
    response.data = graph.toGetDto()
    return response

@router.post("/project/{projectid}")
def create(graphdto: GraphCreateDto, projectid: int, db: Session = Depends(get_db)):
    response = Response()
    project = db.query(Project).filter(Project.id == projectid).first()
    if not project:
        response.add_error("id", "project not found")
        raise HttpException(status_code=404, response=response)
    if len(graphdto.name) == 0:
        response.add_error("name", "name must not be empty")
        raise HttpException(status_code=400, response=response)
    graph = Graph(
        name=graphdto.name,
        description=graphdto.description,
        project=project
    )
    db.add(graph)
    db.commit()
    response.data = graph.toGetDto()
    return response

@router.patch("/{id}")
def update(graphdto: GraphUpdateDto, id: int, db: Session = Depends(get_db)):
    response = Response()
    graph = db.query(Graph).filter(Graph.id == id).first()
    if not graph:
        response.add_error("id", "graph not found")
        raise HttpException(status_code=404, response=response)
    if len(graph.name) == 0:
        response.add_error("name", "name cannot be empty")
        raise HttpException(status_code=400, response=response)
    graph.name = graphdto.name
    graph.description = graphdto.description
    db.commit()
    response.data = graph.toGetDto()
    return response

@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db)):
    response = Response()
    graph = db.query(Graph).filter(Graph.id == id).first()
    if not graph:
        response.add_error("id", "graph not found")
        raise HttpException(status_code=404, response=response)
    db.delete(graph)
    db.commit()
    response.data = True
    return response