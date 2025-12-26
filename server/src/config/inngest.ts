import { Inngest } from "inngest";
import { connectDB } from "./database";
import { UserModel } from "../model/user.model";

interface ClerkUserData {
    id: string;
    email_addresses: Array<{email_address: string}>;
    first_name: string | null;
    last_name: string | null;
    image_url?: string | null;
    created_at: number;
}

interface ClerkUserCreatedEvent {
    name: "clerk/user.created";
    data: ClerkUserData;
}

interface ClerkUserDeletedEvent {
    name: "clerk/user.deleted";
    data: {
        id: string;
    };
}

type Events = ClerkUserCreatedEvent | ClerkUserDeletedEvent;

// Create a client to send and receive events
export const inngest = new Inngest({ id: "college-rage" });


const syncUser = inngest.createFunction(
    {id: "sync-user"},
    {event: "clerk/user.created"},
    async ({event}) => {
        await connectDB();

        const {id, email_addresses, first_name, last_name, image_url, created_at} = event.data

        const newUser = {
            clerkId: id,
            email: email_addresses[0]?.email_address, 
            fullName: `${first_name || ""} ${last_name || ""}`.trim(),
            profilePicture: image_url,
            createdAt: new Date(created_at)
        };

        await UserModel.create(newUser);
    }
)

const deleteUser = inngest.createFunction(
    {id: "delete-user"},
    {event: "clerk/user.deleted"},
    async ({event}) => {
        const {id} = event.data

        await UserModel.deleteOne({clerkId: id});
    }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUser, deleteUser];