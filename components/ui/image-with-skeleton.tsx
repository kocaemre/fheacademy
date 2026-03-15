"use client"

import { useState } from "react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ImageWithSkeletonProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

export function ImageWithSkeleton({
  src,
  alt,
  width,
  height,
  className,
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!loaded && (
        <Skeleton
          className="absolute inset-0 rounded-none"
          style={{ aspectRatio: `${width}/${height}` }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "w-full h-auto transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
