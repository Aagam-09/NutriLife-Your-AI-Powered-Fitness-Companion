import { Book, Menu, Sunset, Trees } from "lucide-react";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";

interface MenuItem {
    title: string;
    url: string;
    description?: string;
    icon?: React.ReactNode;
    items?: MenuItem[];
}

interface Navbar1Props {
    logo?: {
        url: string;
        src: string;
        alt: string;
        title: string;
    };
    menu?: MenuItem[];
    mobileExtraLinks?: {
        name: string;
        url: string;
    }[];
    auth?: {
        login: {
            text: string;
            url: string;
        };
        signup: {
            text: string;
            url: string;
        };
    };
}

const Navbar1 = ({
    logo = {
        url: "/",
        src: "https://www.shadcnblocks.com/images/block/block-1.svg",
        alt: "NutriLife logo",
        title: "NutriLife",
    },
    menu = [
        { title: "Home", url: "/" },
        {
            title: "Features",
            url: "#",
            items: [
                {
                    title: "Dashboard",
                    description: "Track your daily calories and progress",
                    icon: <Book className="size-5 shrink-0" />,
                    url: "/dashboard",
                },
                {
                    title: "Meal Logger",
                    description: "Quickly log meals and nutrition info",
                    icon: <Trees className="size-5 shrink-0" />,
                    url: "/meals",
                },
                {
                    title: "Diet Plans",
                    description: "Get AI-generated personalized meal plans",
                    icon: <Sunset className="size-5 shrink-0" />,
                    url: "/diet",
                }
            ],
        },
        {
            title: "About",
            url: "#",
        },
    ],
    mobileExtraLinks = [
        { name: "Support", url: "#" },
        { name: "Privacy", url: "#" },
    ],
    auth = {
        login: { text: "Log in", url: "/login" },
        signup: { text: "Sign up", url: "/signup" },
    },
}: Navbar1Props) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("token"));
    }, []);

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    return (
        <section className="py-4 fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
            <div className="container mx-auto px-4 md:px-6">
                <nav className="hidden justify-between lg:flex">
                    <div className="flex items-center gap-6">
                        <a href={logo.url} className="flex items-center gap-2">
                            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">{logo.title}</span>
                        </a>
                        <div className="flex items-center">
                            <NavigationMenu>
                                <NavigationMenuList>
                                    {menu.map((item) => renderMenuItem(item))}
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isLoggedIn ? (
                            <>
                                <Button asChild variant="outline" size="sm">
                                    <a href="/profile">Profile</a>
                                </Button>
                                <Button onClick={handleLogout} size="sm" className="bg-primary text-white hover:bg-primary/90">
                                    Log Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button asChild variant="outline" size="sm">
                                    <a href={auth.login.url}>{auth.login.text}</a>
                                </Button>
                                <Button asChild size="sm" className="bg-primary text-white hover:bg-primary/90">
                                    <a href={auth.signup.url}>{auth.signup.text}</a>
                                </Button>
                            </>
                        )}
                    </div>
                </nav>
                <div className="block lg:hidden">
                    <div className="flex items-center justify-between">
                        <a href={logo.url} className="flex items-center gap-2">
                            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">{logo.title}</span>
                        </a>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Menu className="size-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="overflow-y-auto w-3/4 max-w-sm">
                                <SheetHeader>
                                    <SheetTitle>
                                        <a href={logo.url} className="flex items-center gap-2">
                                            <span className="text-lg font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                                                {logo.title}
                                            </span>
                                        </a>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="my-6 flex flex-col gap-6">
                                    <Accordion
                                        type="single"
                                        collapsible
                                        className="flex w-full flex-col gap-4"
                                    >
                                        {menu.map((item) => renderMobileMenuItem(item))}
                                    </Accordion>
                                    <div className="border-t py-4">
                                        <div className="grid grid-cols-2 justify-start">
                                            {mobileExtraLinks.map((link, idx) => (
                                                <a
                                                    key={idx}
                                                    className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground"
                                                    href={link.url}
                                                >
                                                    {link.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {isLoggedIn ? (
                                            <>
                                                <Button variant="outline" asChild>
                                                    <a href="/profile">Profile</a>
                                                </Button>
                                                <Button onClick={handleLogout} className="bg-primary text-white hover:bg-primary/90">
                                                    Log Out
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button variant="outline" asChild>
                                                    <a href={auth.login.url}>{auth.login.text}</a>
                                                </Button>
                                                <Button asChild className="bg-primary text-white hover:bg-primary/90">
                                                    <a href={auth.signup.url}>{auth.signup.text}</a>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </section>
    );
};

const renderMenuItem = (item: MenuItem) => {
    if (item.items) {
        return (
            <NavigationMenuItem key={item.title} className="text-muted-foreground">
                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                <NavigationMenuContent>
                    <ul className="w-80 p-3">
                        <NavigationMenuLink>
                            {item.items.map((subItem) => (
                                <li key={subItem.title}>
                                    <a
                                        className="flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
                                        href={subItem.url}
                                    >
                                        {subItem.icon}
                                        <div>
                                            <div className="text-sm font-semibold">
                                                {subItem.title}
                                            </div>
                                            {subItem.description && (
                                                <p className="text-sm leading-snug text-muted-foreground">
                                                    {subItem.description}
                                                </p>
                                            )}
                                        </div>
                                    </a>
                                </li>
                            ))}
                        </NavigationMenuLink>
                    </ul>
                </NavigationMenuContent>
            </NavigationMenuItem>
        );
    }

    return (
        <a
            key={item.title}
            className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground"
            href={item.url}
        >
            {item.title}
        </a>
    );
};

const renderMobileMenuItem = (item: MenuItem) => {
    if (item.items) {
        return (
            <AccordionItem key={item.title} value={item.title} className="border-b-0">
                <AccordionTrigger className="py-0 font-semibold hover:no-underline">
                    {item.title}
                </AccordionTrigger>
                <AccordionContent className="mt-2">
                    {item.items.map((subItem) => (
                        <a
                            key={subItem.title}
                            className="flex select-none gap-4 rounded-md p-3 leading-none outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
                            href={subItem.url}
                        >
                            {subItem.icon}
                            <div>
                                <div className="text-sm font-semibold">{subItem.title}</div>
                                {subItem.description && (
                                    <p className="text-sm leading-snug text-muted-foreground">
                                        {subItem.description}
                                    </p>
                                )}
                            </div>
                        </a>
                    ))}
                </AccordionContent>
            </AccordionItem>
        );
    }

    return (
        <a key={item.title} href={item.url} className="font-semibold block py-2">
            {item.title}
        </a>
    );
};

export { Navbar1 };
