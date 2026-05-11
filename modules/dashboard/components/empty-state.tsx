import React from 'react'
import Image from 'next/image'

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
      <div className="bg-muted/30 p-8 rounded-full mb-6">
        <Image 
          src="/empty-state.svg" 
          alt="No projects" 
          width={192} 
          height={192} 
          className="opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-500" 
        />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">No projects found</h2>
      <p className="text-muted-foreground text-center max-w-sm">
        Your dashboard is looking a bit empty. <br /> Create a new project to start coding!
      </p>
    </div>
  )
}

export default EmptyState