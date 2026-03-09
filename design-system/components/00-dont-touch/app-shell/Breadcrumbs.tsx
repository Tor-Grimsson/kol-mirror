import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbsProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <Breadcrumb className="animate-fade-in">
      <BreadcrumbList className="text-xs flex-nowrap whitespace-nowrap">
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="flex items-center gap-1 transition-all hover:text-primary">
            <Home className="w-3 h-3" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        {items.map((item, index) => (
          <span key={`breadcrumb-${index}`} className="contents">
            <BreadcrumbSeparator className="opacity-50">
              <ChevronRight className="w-3 h-3" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {index === items.length - 1 ? (
                <BreadcrumbPage className="font-medium">{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href} className="transition-all hover:text-primary">
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
