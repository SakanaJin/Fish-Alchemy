from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from Fish_Alchemy_Data.database import get_db
from Fish_Alchemy_Data.Common.Response import Response, HttpException

from Fish_Alchemy_Data.Entities.Nodes import Node, NodeCreateDto, NodeUpdateDto
from Fish_Alchemy_Data.Entities.NodeAssociation import NodeAssociation
from Fish_Alchemy_Data.Entities.Graphs import Graph

router = APIRouter(prefix="/api/nodes", tags=['Nodes'])

@router.get("/")
def get_all(db: Session = Depends(get_db)):
    response = Response()
    nodes = db.query(Node).all()
    response.data = [node.toGetDto() for node in nodes]
    return response

@router.get("/id")
def get_by_id(id: int, db: Session = Depends(get_db)):
    response = Response()
    node = db.query(Node).filter(Node.id == id).first()
    if not node:
        response.add_error("id", "node not found")
        raise HttpException(status_code=404, response=response)
    response.data = node.toGetDto()
    return response

@router.get("/graph/{id}")
def get_by_graph(id: int, db: Session = Depends(get_db)):
    response = Response()
    graph = db.query(Graph).filter(Graph.id == id).first()
    if not graph:
        response.add_error("id", "graph not found")
        raise HttpException(status_code=404, response=response)
    response.data = [node.toGetDto() for node in graph.nodes]
    return response

@router.post("/graph/{graphid}")
def create(nodedto: NodeCreateDto, graphid: int, db: Session = Depends(get_db)):
    response = Response()
    graph = db.query(Graph).filter(Graph.id == graphid).first()
    if not graph:
        response.add_error("id", "graph not found")
        raise HttpException(status_code=404, response=response)
    if len(nodedto.name) == 0:
        response.add_error("name", "name cannot be empty")
        raise HttpException(status_code=400, response=response)
    node = Node(
        name=nodedto.name,
        graph=graph
    )
    db.add(node)
    db.commit()
    response.data = node.toGetDto()
    return response

@router.post("/dependent/{dependentid}/dependency/{dependencyid}")
def connect_nodes(dependentid: int, dependencyid: int, db: Session = Depends(get_db)):
    response = Response()
    dependent = db.query(Node).filter(Node.id == dependentid).first()
    dependency = db.query(Node).filter(Node.id == dependencyid).first()
    if not dependent:
        response.add_error("dependentid", "dependent node not found")
    if not dependency:
        response.add_error("dependencyid", "dependency node not found")
    if response.has_errors:
        raise HttpException(status_code=404, response=response)
    if dependent.id == dependency.id:
        response.add_error("id", "cannot connect node to itself")
        raise HttpException(status_code=400, response=response)
    edge = NodeAssociation(dependent=dependent, dependency=dependency)
    db.add(edge)
    db.commit()
    response.data = True
    return response

@router.delete("/dependent/{dependentid}/dependency/{dependencyid}")
def disconnect_nodes(dependentid: int, dependencyid: int, db: Session = Depends(get_db)):
    response = Response()
    connection = db.query(NodeAssociation).filter(NodeAssociation.dependency_id == dependencyid and NodeAssociation.dependent_id == dependentid).first()
    if not connection:
        response.add_error("edge", "nodes not connected")
        raise HttpException(status_code=400, response=response)
    db.delete(connection)
    db.commit()
    response.data = True
    return response

@router.patch("/{id}")
def update(nodedto: NodeUpdateDto, id: int, db: Session = Depends(get_db)):
    response = Response()
    node = db.query(Node).filter(Node.id == id).first()
    if not node:
        response.add_error("id", "node not found")
        raise HttpException(status_code=404, response=response)
    if len(nodedto.name) == 0:
        response.add_error("name", "name cannot be empty")
        raise HttpException(status_code=400, response=response)
    node.name = nodedto.name
    db.commit()
    response.data = node.toGetDto()
    return response

@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db)):
    response = Response()
    node = db.query(Node).filter(Node.id == id).first()
    if not node:
        response.add_error("id", "node not found")
        raise HttpException(status_code=404, response=response)
    db.delete(node)
    db.commit()
    response.data = True
    return response