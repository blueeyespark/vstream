import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { platform } from "@/platform/client";

const BlueContext = createContext(null);
const MODES = ["teacher","build","creator","stream","desktop","companion"];

export function BlueProvider({ children }) {
  const [mode,setModeState]=useState("teacher");
  const [conversationId,setConversationId]=useState(null);
  const [capabilities,setCapabilities]=useState(null);
  const [permissions,setPermissions]=useState(null);
  const [history,setHistory]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [activeConversation,setActiveConversation]=useState(null);
  const [memory,setMemory]=useState([]);
  const [results,setResults]=useState([]);

  const refresh=useCallback(async()=>{
    try {
      const [caps,perms,convos,memoryData,resultData]=await Promise.all([
        platform.ai.capabilities(),
        platform.blue.permissions(),
        platform.ai.conversations(),
        platform.blue.memory(),
        platform.blue.results(),
      ]);
      setCapabilities(caps);
      setPermissions(perms);
      setHistory(convos?.conversations || []);
      setMemory(memoryData?.memories || []);
      setResults(resultData?.results || []);
      if (conversationId) {
        const current=(convos?.conversations || []).find((item)=>item.id===conversationId);
        if(current) setActiveConversation(current);
      }
      setError(null);
    } catch (e) {
      setError(e?.message || "Blue is unavailable");
    }
  },[conversationId]);

  useEffect(()=>{ refresh(); },[refresh]);

  const setMode=useCallback((next)=>{
    if(!MODES.includes(next)) return false;
    setModeState(next);
    return true;
  },[]);

  const startConversation=useCallback((nextMode=mode)=>{
    setConversationId(null);
    setActiveConversation(null);
    setMode(nextMode);
  },[mode,setMode]);

  const openConversation=useCallback(async(id)=>{
    const data=await platform.ai.conversation(id);
    setConversationId(data.conversation.id);
    setActiveConversation(data.conversation);
    setMode(data.conversation.mode);
    return data;
  },[setMode]);

  const send=useCallback(async({prompt,messages,mode:requestedMode,context}={})=>{
    const activeMode=MODES.includes(requestedMode) ? requestedMode : mode;
    setLoading(true); setError(null);
    try {
      const result=await platform.ai.generate({
        prompt,
        messages,
        mode:activeMode,
        conversation_id:conversationId,
        context,
      });
      if(result?.conversation_id) setConversationId(result.conversation_id);
      await refresh();
      return result;
    } catch(e) {
      setError(e?.message || "Blue could not complete the request");
      throw e;
    } finally { setLoading(false); }
  },[mode,conversationId,refresh]);

  const remember=useCallback(async(entry)=>{
    const value=await platform.blue.remember(entry);
    await refresh();
    return value;
  },[refresh]);

  const forget=useCallback(async(id)=>{
    await platform.blue.forget(id);
    await refresh();
  },[refresh]);

  const createResult=useCallback(async(result)=>{
    const value=await platform.blue.createResult({...result,conversation_id:result?.conversation_id || conversationId});
    await refresh();
    return value;
  },[conversationId,refresh]);

  const setPermissionLevel=useCallback(async(action_level)=>{
    const value=await platform.blue.setPermissionLevel(action_level);
    setPermissions(value);
    return value;
  },[]);

  const value=useMemo(()=>({
    identity:{name:"Blue"},
    modes:MODES,mode,setMode,
    conversationId,activeConversation,startConversation,openConversation,history,
    capabilities,permissions,setPermissionLevel,
    memory,remember,forget,results,createResult,
    loading,error,send,refresh,
  }),[mode,setMode,conversationId,activeConversation,startConversation,openConversation,history,capabilities,permissions,setPermissionLevel,memory,remember,forget,results,createResult,loading,error,send,refresh]);

  return <BlueContext.Provider value={value}>{children}</BlueContext.Provider>;
}

export function useBlue() {
  const value=useContext(BlueContext);
  if(!value) throw new Error("useBlue must be used inside BlueProvider");
  return value;
}
