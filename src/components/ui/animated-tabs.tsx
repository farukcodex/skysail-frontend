"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { motion } from "motion/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AnimatedUnderlineTabsDemo = ({
  tabs,
}: {
  tabs: {
    name: string;
    value: string;
    content: React.ReactNode;
  }[];
}) => {
  const [activeTab, setActiveTab] = useState("posts");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useLayoutEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
    const activeTabElement = tabRefs.current[activeIndex];

    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;

      setUnderlineStyle({
        left: offsetLeft,
        width: offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div className="w-full ">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
        <TabsList className="bg-background relative rounded-none p-0 border-b w-full flex justify-start">
          <div className="">
            {tabs.map((tab, index) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                className="relative z-10 rounded-none border-0 text-lg bg-transparent! data-active:shadow-none!"
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </div>

          <motion.div
            className="bg-[#C49A3C] absolute bottom-0 h-0.5"
            animate={{
              left: underlineStyle.left,
              width: underlineStyle.width,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 40,
            }}
          />
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="text-muted-foreground text-sm">{tab.content}</div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AnimatedUnderlineTabsDemo;
