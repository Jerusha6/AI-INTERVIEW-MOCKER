"use client"
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";

function Header() {
    const path=usePathname();

  return (
    <div className="flex p-4 items-centre justify-between bg-secondary shadow-sm">
      <Image src={"/logo.svg"} width={160} height={100} alt="logo" />
      <ul className="flex gap-6">
        <li
          className={`hover:text-[#0A717C] hover:font-bold transition-all cursor-pointer 
            ${path == "/dashboard" && "text-[#0A717C] font-bold"}
            `}
        >
          Dashboard
        </li>
        <li
          className={`hover:text-[#0A717C] hover:font-bold transition-all cursor-pointer 
            ${path == "/questions" && "text-[#0A717C] font-bold"}
            `}
        >
          Questions
        </li>
        <li
          className={`hover:text-[#0A717C] hover:font-bold transition-all cursor-pointer 
            ${path == "/upgrade" && "text-[#0A717C] font-bold"}
            `}
        >
          Upgrade
        </li>
        <li
          className={`hover:text-[#0A717C] hover:font-bold transition-all cursor-pointer 
            ${path == "/working" && "text-[#0A717C] font-bold"}
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
