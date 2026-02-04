"use client"
import { usePlayground } from '@/modules/playground/hooks/usePlayground';
import { useParams } from 'next/navigation';
import React from 'react'

const MainPlaygroundPage = () => {
    const{id} =  useParams<{id: string}>();
    const {playgroundData, templateData, isLoading, error, saveTemplateData} = usePlayground(id);
    console.log("TemplateData:", templateData);
    console.log("PlaygroundData:", playgroundData);
  return (
    <div>
        params: {id}
    </div>
  )
}

export default MainPlaygroundPage