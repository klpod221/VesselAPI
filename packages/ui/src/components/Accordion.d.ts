import * as React from "react";
interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
    type?: "single" | "multiple";
    collapsible?: boolean;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}
declare const Accordion: React.ForwardRefExoticComponent<AccordionProps & React.RefAttributes<HTMLDivElement>>;
interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}
declare const AccordionItem: React.ForwardRefExoticComponent<AccordionItemProps & React.RefAttributes<HTMLDivElement>>;
interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value?: string;
}
declare const AccordionTrigger: React.ForwardRefExoticComponent<AccordionTriggerProps & React.RefAttributes<HTMLButtonElement>>;
interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
}
declare const AccordionContent: React.ForwardRefExoticComponent<AccordionContentProps & React.RefAttributes<HTMLDivElement>>;
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
//# sourceMappingURL=Accordion.d.ts.map