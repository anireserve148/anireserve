"use client"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface GalleryPhoto {
    id: string
    imageUrl: string
    caption?: string | null
}

export function ProGallery({ photos }: { photos: GalleryPhoto[] }) {
    const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null)

    // Debug: Log photos to verify data is received
    console.log('ProGallery - Received photos:', photos.length, photos)

    if (photos.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">Aucune photo dans la galerie</p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo) => (
                    <div
                        key={photo.id}
                        className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
                        onClick={() => setSelectedPhoto(photo)}
                    >
                        <Image
                            src={photo.imageUrl}
                            alt={photo.caption || "Photo de galerie"}
                            fill
                            className="object-cover transition-transform group-hover:scale-110"
                        />
                        {photo.caption && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <p className="text-white text-sm font-medium">{photo.caption}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden">
                    {selectedPhoto && (
                        <div className="relative">
                            <button
                                onClick={() => setSelectedPhoto(null)}
                                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="relative w-full h-[80vh]">
                                <Image
                                    src={selectedPhoto.imageUrl}
                                    alt={selectedPhoto.caption || "Photo"}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            {selectedPhoto.caption && (
                                <div className="bg-background p-4 border-t">
                                    <p className="text-sm text-muted-foreground">{selectedPhoto.caption}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
