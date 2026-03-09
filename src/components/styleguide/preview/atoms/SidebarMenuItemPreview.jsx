import { useState } from 'react'
import { SidebarMenuItem } from '@kol/ui'
import DesSection from '../molecules/DesSection'
import DesCard from '../molecules/DesCard'
import SurfacePreviewGrid from '../molecules/SurfacePreviewGrid'

export default function SidebarMenuItemPreview({ nativeOnly = false }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const sampleChildren = [
    { id: 'child-1', label: 'Overview', path: '#', icon: 'component' },
    { id: 'child-2', label: 'Settings', path: '#', icon: 'component' }
  ]

  return (
    <div className="space-y-8">
      <DesSection
        name="Sidebar Menu Item"
        description="Flexible menu item for sidebar navigation."
        details="Supports direct links, groups with children, and collapsed states"
      />

      <DesCard
        name="Direct Link"
        description="Simple navigation link with icon"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <div className="w-64">
            <SidebarMenuItem
              label="Dashboard"
              icon="component"
              to="#"
            />
          </div>
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <div className="w-64">
            <SidebarMenuItem
              label="Dashboard"
              icon="component"
              to="#"
            />
          </div>
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>

      <DesCard
        name="Group with Children"
        description="Expandable menu group with nested items"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <div className="w-64">
            <SidebarMenuItem
              label="Components"
              icon="component"
              hasChildren
              isExpanded={isExpanded}
              onClick={() => setIsExpanded(!isExpanded)}
              children={sampleChildren}
            />
          </div>
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <div className="w-64">
            <SidebarMenuItem
              label="Components"
              icon="component"
              hasChildren
              isExpanded={isExpanded}
              onClick={() => setIsExpanded(!isExpanded)}
              children={sampleChildren}
            />
          </div>
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>

      <DesCard
        name="Collapsed"
        description="Icon-only state for collapsed sidebar"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <SidebarMenuItem
            label="Dashboard"
            icon="component"
            to="#"
            isCollapsed
          />
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <SidebarMenuItem
            label="Dashboard"
            icon="component"
            to="#"
            isCollapsed
          />
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>
    </div>
  )
}
