"use client"
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";

function Header() {
    const path=usePathname();

  return (
    <div className="flex p-2 items-centre justify-between bg-[#b3e2e7] shadow-md">
      <Image src={"/logo.svg"} width={160} height={100} alt="logo" />
      <ul className="hidden md:flex gap-6 mt-5">
        <li
          className={`
           text-lg hover:text-[#0A717C] hover:font-bold transition-all cursor-pointer 
            ${path == "/dashboard" && "text-[#0A717C] font-bold"}
            `}
        >
          Dashboard
        </li>
        <li
          className={`text-lg hover:text-[#0A717C] hover:font-bold transition-all cursor-pointer 
            ${path == "/dashboard/questions" && "text-[#0A717C] font-bold"}
            `}
        >
          Questions
        </li>
        <li
          className={`text-lg hover:text-[#0A717C] hover:font-bold transition-all cursor-pointer 
            ${path == "/dashboard/upgrade" && "text-[#0A717C] font-bold"}
            `}
        >
          Upgrade
        </li>
        <li
          className={`text-lg hover:text-[#0A717C] hover:font-bold transition-all cursor-pointer 
            ${path == "/dashboard/working" && "text-[#0A717C] font-bold"}
            `}
        >
          How it works?
        </li>
      </ul>
      <UserButton />
    </div>
  );
}

export default Header;
