'use client'
import {IconDeviceFloppy, IconLoader2, IconPhotoPlus, IconTrash, IconUpload} from "@tabler/icons-react";
import React, {ChangeEvent, useContext, useEffect, useRef, useState} from "react";
import {SessionContext} from "@/app/components/context-providers/session-context";
import {Card, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/react";
import {v4} from 'uuid'
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";

function UploadPhoto({
                         setBannerImage,
                         userId,
                         onImageUpload,
                     }: { setBannerImage?: Function, userId?: string, onImageUpload?: Function }) {
    const [file, setFile] = useState<File | null>(null) // or appropriate initial state
    const [preview, setPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null
        if (!file) return

        processFile(file)
    };

    const processFile = (file: File) => {
        if (file.size > 1048576) {
            alert('Image size must be less than 1MB')
            return
        }
        setFile(file)
        // Create a preview
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }

    }
    const uploadImage = () => {
        if (!file) return
        setIsUploading(true)
        const database = createClientComponentClient()
        const upsertImage = async () => {
            const path = `${userId}/banner/`
            const previousImage = await findLastImage(path)

            const {
                error,
                data
            } = await database.storage.from('users-profile-images')
                .upload(`${path}/${v4()}`, file, {
                    cacheControl: '3600',
                    upsert: true,
                })

            setIsUploading(false)

            if (error) {
                console.error(error)
                return
            }
            if (previousImage) {
                const {error} = await database.storage.from('users-profile-images').remove([`${path}${previousImage.name}`])
                if (error) {
                    console.error(error)
                    throw error
                }
            }

            onImageUpload && onImageUpload()
            if (data?.path) {
                const {data: {publicUrl: newImageUrl}} = database.storage.from('users-profile-images').getPublicUrl(data?.path)
                setBannerImage && setBannerImage(newImageUrl)
            }
        }
        upsertImage()
    }

    const handleDrop = (e: {
        preventDefault: () => void;
        stopPropagation: () => void;
        dataTransfer: { files: any; };
    }) => {
        e.preventDefault();
        e.stopPropagation();

        const files = e.dataTransfer?.files;
        if (files?.length) {
            processFile(files[0]);
        }
    }
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    }

    return (
        <div
            className={`${!preview ? 'cursor-pointer ' : ''}bg-gray-900 text-white p-6 m-4 min-h-[200px] rounded-lg border border-dashed border-gray-600 flex flex-col items-center relative justify-center`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={triggerFileInput}
        >
            {/* Upload Button */}
            {!preview && (<>
                    <IconUpload
                        className="w-12 h-12 text-white"
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="absolute opacity-0 w-full h-full top-0 left-0 cursor-pointer -z-10"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleImageUpload}
                    />
                </>
            )}
            {preview && (
                <div className="mt-4">
                    <h2 className="text-xl mb-2">Preview:</h2>
                    <img className="rounded-lg" src={preview} alt="Preview"/>
                    <div className="flex gap-2 mt-4 text-sm justify-between">
                        <button
                            className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-full"
                            onClick={() => {
                                setFile(null)
                                setPreview(null)
                            }}><IconTrash/></button>
                        <button
                            disabled={!file || isUploading}
                            onClick={uploadImage}
                            className="bg-sky-500 hover:bg-sky-700 text-white px-4 py-2 rounded-full disabled:bg-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-500"
                        >{
                            isUploading ? <IconLoader2 className="animate-spin"/> : <IconDeviceFloppy/>
                        } </button>
                    </div>
                </div>
            )}
        </div>
    );
}

type ChangeImageModalProps = {
    isOpen?: boolean,
    onOpenChange?: (isOpen: any) => void
    userId?: string
    title?: string
    setBannerImage?: Function
    onClose?: () => void
}
const ChangeImageModal = ({
                              isOpen,
                              onOpenChange,
                              onClose,
                              userId,
                              title,
                              setBannerImage,
                          }: ChangeImageModalProps) => {
    return (
        <Modal
            isOpen={isOpen}
            disableAnimation
            onOpenChange={onOpenChange}
            placement="top"
            classNames={{
                backdrop: 'bg-[rgba(255,255,255,0.2)]',
                closeButton: 'bg-black'
            }}
        >
            <Card>
                <ModalContent className="p-0">
                    {() => (
                        <>
                            <ModalHeader className="bg-black">{title || 'Upload Image'}</ModalHeader>
                            <ModalBody className="bg-black p-0 gap-0">
                                <UploadPhoto setBannerImage={setBannerImage} userId={userId} onImageUpload={onClose}/>
                            </ModalBody>
                            <ModalFooter className="bg-black">
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Card>
        </Modal>
    )
}

const findLastImage = async (path: string) => {
    const database = createClientComponentClient()
    const {
        data,
        error
    } = await database.storage.from('users-profile-images').list(path, {
        limit: 1,
        offset: 0,
        sortBy: {
            column: 'created_at',
            order: 'desc'
        }
    })
    if (error) {
        throw error
    }
    if (data.length) {
        const [file] = data
        return file
    }
}

export function UserBanner({user}: { user?: { id?: string } }) {
    const context = useContext(SessionContext)
    const session = context?.sessionContext
    const {
        isOpen,
        onOpen,
        onClose,
        onOpenChange
    } = useDisclosure();

    const [bannerImage, setBannerImage] = useState<string>('');
    const database = createClientComponentClient()

    useEffect(() => {
            if (!user?.id) return
            const findUserBannerImage = async () => {
                const path = `${user?.id}/banner/`
                const file = await findLastImage(path)
                if (!file) return
                const {data: {publicUrl}} = database.storage.from('users-profile-images').getPublicUrl(`${path}${file.name}`)
                if (!publicUrl) return
                setBannerImage(publicUrl)
            }
            findUserBannerImage()
        }, [user?.id]
    )

    return (
        <div className={`h-96 max-h-96 overflow-hidden bg-violet-600 w-full relative group`}>
            {bannerImage &&
              <img src={bannerImage} className="w-full h-full object-cover" alt={'User profile image'}/>}
            {session && session.user?.id === user?.id &&
              <div
                onClick={onOpen}
                className="absolute top-0 left-0 w-full h-full bg-black/50 hidden group-hover:flex align-middle justify-center items-center cursor-pointer">
                <IconPhotoPlus
                  className="w-12 h-12 text-white"
                />
                <ChangeImageModal
                  userId={session.user?.id}
                  isOpen={isOpen}
                  onClose={onClose}
                  onOpenChange={onOpenChange}
                  title="Change your banner"
                  setBannerImage={setBannerImage}
                />
              </div>
            }
        </div>
    )
}
