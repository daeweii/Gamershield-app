import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { READY_TOOLS, SECTIONS, findCategory, toolHref, type Tool } from '@/lib/platform/registry';
import { searchPlatform } from '@/lib/platform/search';
import { Icon } from './Icon';

/** Open a tool: in-app tools change route; standalone pages (the generator) load their own page. */
export function useOpenTool() {
  const [, navigate] = useLocation();
  return (tool: Tool) => {
    const href = toolHref(tool);
    if (tool.standalonePath) window.location.assign(`${import.meta.env.BASE_URL}${href}`);
    else navigate(href);
  };
}

/**
 * Global search (Ctrl+K). Built on cmdk, which was already in the project:
 * it handles the combobox keyboard pattern (arrows, Enter, Escape) and screen-reader roles.
 * Filtering uses Sentrix's own tested search, so cmdk's filter is turned off.
 */
export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState('');
  const [, navigate] = useLocation();
  const openTool = useOpenTool();
  const results = useMemo(() => searchPlatform(query), [query]);

  function close() {
    onOpenChange(false);
    setQuery('');
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { onOpenChange(next); if (!next) setQuery(''); }}>
      <DialogContent className="sx-search-dialog overflow-hidden p-0">
      <DialogTitle className="sx-sr-only">Search Sentrix</DialogTitle>
      <DialogDescription className="sx-sr-only">Type to find a tool or section, then use the arrow keys and Enter.</DialogDescription>
      {/* shouldFilter off: results come from searchPlatform(), not cmdk's own matching. */}
      <Command shouldFilter={false} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3">
      <CommandInput placeholder="Search tools and sections…" value={query} onValueChange={setQuery} aria-label="Search Sentrix" />
      <CommandList>
        <CommandEmpty>No tools or sections match “{query}”.</CommandEmpty>
        {query.trim() ? (
          <CommandGroup heading="Results">
            {results.map((result) => (
              <CommandItem
                key={`${result.kind}-${result.item.id}`}
                value={`${result.kind}-${result.item.id}`}
                onSelect={() => { close(); if (result.kind === 'tool') openTool(result.item); else navigate(result.item.path); }}
              >
                <span className="sx-search-item">
                  <span className="sx-search-item-icon"><Icon name={result.item.icon} size={16} /></span>
                  <span>
                    {result.item.name}
                    <small>{result.kind === 'tool' ? findCategory(result.item.category)?.name : 'Section'} · {result.item.summary}</small>
                  </span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : (
          <>
            <CommandGroup heading="Tools">
              {READY_TOOLS.map((tool) => (
                <CommandItem key={tool.id} value={`tool-${tool.id}`} onSelect={() => { close(); openTool(tool); }}>
                  <span className="sx-search-item">
                    <span className="sx-search-item-icon"><Icon name={tool.icon} size={16} /></span>
                    <span>{tool.name}<small>{findCategory(tool.category)?.name}</small></span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Sections">
              {SECTIONS.map((section) => (
                <CommandItem key={section.id} value={`section-${section.id}`} onSelect={() => { close(); navigate(section.path); }}>
                  <span className="sx-search-item">
                    <span className="sx-search-item-icon"><Icon name={section.icon} size={16} /></span>
                    <span>{section.name}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
      </Command>
      </DialogContent>
    </Dialog>
  );
}
