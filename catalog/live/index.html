import cloudinary from '../lib/cloudinary.js';
import fs from 'fs';
import path from 'path';

let memoryCatalog = null;

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, x-publish-token');
  if(req.method==='OPTIONS') return res.status(200).end();
  
  const { action } = req.query;
  const bodyAction = req.body?.action;
  const act = action || bodyAction;

  // GET catalog
  if(req.method==='GET'){
    try{
      const p = path.join(process.cwd(), 'catalog/live/data.json');
      if(fs.existsSync(p)){
        const data = fs.readFileSync(p,'utf8');
        return res.status(200).send(data);
      }
      if(memoryCatalog) return res.status(200).json(memoryCatalog);
      return res.status(200).json({shopName:"Anmol Jewelers", items:[], categories:[], metalRates:{}, updatedAt: new Date().toISOString()});
    }catch(e){
      return res.status(200).json(memoryCatalog || {items:[]});
    }
  }

  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});

  try{
    if(act==='uploadPhoto'){
      const { key, base64 } = req.body;
      if(!base64) return res.status(400).json({error:'base64 missing'});
      const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64}`, {
        folder: 'anmol-jewelers-catalog',
        public_id: key.replace(/[^a-zA-Z0-9_-]/g,'_'),
        overwrite: true,
      });
      return res.status(200).json({url: result.secure_url});
    }
    if(act==='publish'){
      const { data } = req.body;
      if(!data) return res.status(400).json({error:'data missing'});
      memoryCatalog = data;
      try{
        const dir = path.join(process.cwd(), 'catalog/live');
        if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
        fs.writeFileSync(path.join(dir,'data.json'), JSON.stringify(data, null, 2));
      }catch(e){ console.log('write fail', e.message); }
      return res.status(200).json({ok:true, jsonUrl:'/catalog/live/data.json'});
    }
    return res.status(400).json({error:'unknown action'});
  }catch(e){
    console.error(e);
    return res.status(500).json({error:e.message});
  }
}
