
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { PanelLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"

type SidebarContextValue = {
  isCollapsed: boolean
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

const SidebarProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const value = React.useMemo(
    () => ({ isCollapsed: isMobile ? false : isCollapsed, isMobile }),
    [isMobile, isCollapsed]
  )

  React.useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false);
    } else {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  )
}

const Sidebar = React.forwardRef<
  HTMLElement,
  React.ComponentProps<"aside"> & { children: React.ReactNode }
>(({ className, children, ...props }, ref) => {
  const { isMobile } = useSidebar();
  const [isHovered, setIsHovered] = React.useState(false);

  const state = !isHovered ? "collapsed" : "expanded";

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-3 left-4 z-50">
            <PanelLeft />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar-background border-r border-sidebar-border">
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      ref={ref}
      className={cn(
        "group hidden md:flex flex-col h-screen sticky top-0 bg-sidebar-background border-r border-sidebar-border transition-all duration-300 ease-in-out z-40",
        state === 'collapsed' ? 'w-16' : 'w-64',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-state={state}
      {...props}
    >
      {children}
    </aside>
  )
})
Sidebar.displayName = "Sidebar"


const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
    const { children } = props;
    return (
         <Sheet>
            <SheetTrigger asChild>
                <Button ref={ref} variant="ghost" size="icon" className={cn("md:hidden", className)} {...props}>
                    <PanelLeft />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-sidebar-background border-r border-sidebar-border">
                {children}
            </SheetContent>
        </Sheet>
    )
})
SidebarTrigger.displayName = "SidebarTrigger"


const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-2 flex items-center shrink-0 h-16", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-grow overflow-y-auto", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-4 mt-auto shrink-0", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"


const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-col gap-1 p-2", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"


const SidebarMenuButton = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean; isActive?: boolean; tooltip?: string }
>(({ className, asChild, isActive, tooltip, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  const { isCollapsed } = useSidebar();

  const button = (
      <Comp
        ref={ref}
        data-active={isActive}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-all duration-200 text-sm font-medium hover:bg-sidebar-border/60 relative",
          "group-data-[state=expanded]:justify-start justify-center",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm hover:bg-sidebar-accent/90",
          className
        )}
        {...props}
      />
  )

  if (isCollapsed && tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" align="center">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return button;
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn("flex-1", className)}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"


export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}

