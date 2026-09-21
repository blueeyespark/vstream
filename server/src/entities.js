import { newId } from "./db.js";

export function entityRoutes(app, db) {
  app.get("/v1/entities/:type", (req,res) => {
    const rows=db.prepare("SELECT * FROM entities WHERE entity_type=? ORDER BY updated_at DESC").all(req.params.type);
    let entities=rows.map(toEntity);
    for (const [key,value] of Object.entries(req.query)) {
      entities=entities.filter((row) => String(row[key]) === String(value));
    }
    res.json(entities);
  });
  app.get("/v1/entities/:type/:id", (req,res) => {
    const row=db.prepare("SELECT * FROM entities WHERE entity_type=? AND id=?").get(req.params.type,req.params.id);
    if(!row) return res.status(404).json({message:"Entity not found"});
    res.json(toEntity(row));
  });
  app.post("/v1/entities/:type", (req,res) => {
    const id=newId(), now=new Date().toISOString();
    db.prepare("INSERT INTO entities(id,entity_type,data_json,created_at,updated_at) VALUES(?,?,?,?,?)")
      .run(id,req.params.type,JSON.stringify(req.body||{}),now,now);
    res.status(201).json({id,...req.body,created_at:now,updated_at:now});
  });
  app.patch("/v1/entities/:type/:id", (req,res) => {
    const row=db.prepare("SELECT * FROM entities WHERE entity_type=? AND id=?").get(req.params.type,req.params.id);
    if(!row) return res.status(404).json({message:"Entity not found"});
    const data={...JSON.parse(row.data_json),...(req.body||{})}, now=new Date().toISOString();
    db.prepare("UPDATE entities SET data_json=?,updated_at=? WHERE id=?").run(JSON.stringify(data),now,row.id);
    res.json({id:row.id,...data,created_at:row.created_at,updated_at:now});
  });
  app.delete("/v1/entities/:type/:id", (req,res) => {
    const out=db.prepare("DELETE FROM entities WHERE entity_type=? AND id=?").run(req.params.type,req.params.id);
    if(!out.changes) return res.status(404).json({message:"Entity not found"});
    res.status(204).end();
  });
}
function toEntity(row){return {id:row.id,...JSON.parse(row.data_json),created_at:row.created_at,updated_at:row.updated_at};}
