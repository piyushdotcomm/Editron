import React from 'react'

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
      <div className="bg-muted/30 p-8 rounded-full mb-6">
        <img src="/empty-state.svg" alt="No projects" className="w-48 h-48 opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-500" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">No projects found</h2>
      <p className="text-muted-foreground text-center max-w-sm">
        Your dashboard is looking a bit empty. <br /> Create a new project to start coding!
      </p>
    </div>
  )
}

export default EmptyState