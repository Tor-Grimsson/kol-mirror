import { Network, Folder, FileText, BookOpen, Layers } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const HierarchyContent = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Hierarchy Documentation</h1>
        <p className="text-sm text-muted-foreground">
          System structure and organizational patterns
        </p>
      </div>

      {/* Tree Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tree Structure</CardTitle>
          <CardDescription>Five-level hierarchical organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Level 1: System */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-warning" />
              <span className="text-sm font-semibold">Level 1: System</span>
              <Badge variant="secondary" className="text-[10px]">Root</Badge>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              Top-level organizational unit. Examples: "Work", "Personal"
            </p>
            <div className="ml-6 pl-4 border-l-2 border-border space-y-4">

              {/* Level 2: Project */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Level 2: Project</span>
                  <Badge variant="secondary" className="text-[10px]">Container</Badge>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Contains related notes and documentation. Examples: "Engineering", "Marketing"
                </p>
                <div className="ml-6 pl-4 border-l-2 border-border space-y-4">

                  {/* Level 3: Note */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold">Level 3: Note</span>
                      <Badge variant="secondary" className="text-[10px]">Content</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Individual note document with multiple editor types
                    </p>
                    <div className="ml-6 pl-4 border-l-2 border-border space-y-4">

                      {/* Level 4: Page */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-secondary" />
                          <span className="text-sm font-semibold">Level 4: Page</span>
                          <Badge variant="secondary" className="text-[10px]">Sub-content</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          Subdivisions within a note for organization
                        </p>
                        <div className="ml-6 pl-4 border-l-2 border-border space-y-4">

                          {/* Level 5: Section */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-semibold">Level 5: Section</span>
                              <Badge variant="secondary" className="text-[10px]">Detail</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">
                              Specific sections within pages for detailed content
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Views */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Views & Behaviors</CardTitle>
          <CardDescription>Different view modes and their characteristics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <h3 className="text-sm font-semibold">Home View</h3>
              <p className="text-xs text-muted-foreground">
                Default workspace with unified sidebar, notes list, and editor. Shows active note with tabs.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px]">Sidebar</Badge>
                <Badge variant="outline" className="text-[10px]">Notes List</Badge>
                <Badge variant="outline" className="text-[10px]">Editor</Badge>
              </div>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <h3 className="text-sm font-semibold">Overview/Projects View</h3>
              <p className="text-xs text-muted-foreground">
                Project management interface with table view and timeline calendar.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px]">Projects Table</Badge>
                <Badge variant="outline" className="text-[10px]">Timeline</Badge>
                <Badge variant="outline" className="text-[10px]">Filters</Badge>
              </div>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <h3 className="text-sm font-semibold">Focus Mode</h3>
              <p className="text-xs text-muted-foreground">
                Distraction-free editor without sidebars. Toggle with Eye icon.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px]">No Sidebars</Badge>
                <Badge variant="outline" className="text-[10px]">Full Screen</Badge>
              </div>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <h3 className="text-sm font-semibold">Note Details View</h3>
              <p className="text-xs text-muted-foreground">
                Metadata and note information. Accessed by flipping note cards.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px]">Metadata</Badge>
                <Badge variant="outline" className="text-[10px]">Statistics</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Editor Types</CardTitle>
          <CardDescription>Four distinct note editing modes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge className="bg-primary/10 text-primary">Modular</Badge>
              <div className="flex-1 text-xs">
                <p className="font-medium mb-1">Block-based editor</p>
                <p className="text-muted-foreground">Drag-and-drop blocks with different types: headings, paragraphs, code, sections. Supports 1-2 column layouts.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge className="bg-secondary/10 text-secondary">Standard</Badge>
              <div className="flex-1 text-xs">
                <p className="font-medium mb-1">Traditional text editor</p>
                <p className="text-muted-foreground">Simple textarea for plain text notes and quick capture.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge className="bg-accent/10 text-accent">Visual</Badge>
              <div className="flex-1 text-xs">
                <p className="font-medium mb-1">Diagram and visual editor</p>
                <p className="text-muted-foreground">For creating visual diagrams, flowcharts, and visual documentation.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interaction Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interaction Patterns</CardTitle>
          <CardDescription>Key user interactions and behaviors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">Selection Indicators</p>
              <p className="text-muted-foreground">Solid yellow circles for active items, dotted yellow outlines for inactive</p>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">Sidebar Resize</p>
              <p className="text-muted-foreground">Drag the right edge of sidebars to resize. Collapse below threshold.</p>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">Tab Management</p>
              <p className="text-muted-foreground">Multiple note tabs with close buttons. Click tab to switch, X to close.</p>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">Filtering</p>
              <p className="text-muted-foreground">System/project selection filters notes and projects automatically.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
