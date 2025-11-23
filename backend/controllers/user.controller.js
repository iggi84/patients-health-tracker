// backend/controllers/user.controller.js
import {
    CognitoIdentityProviderClient,
    ListUsersCommand,
    AdminGetUserCommand,
    AdminCreateUserCommand,
    AdminDeleteUserCommand,
    AdminAddUserToGroupCommand,
    AdminRemoveUserFromGroupCommand,
    AdminUpdateUserAttributesCommand,
    AdminSetUserPasswordCommand,
    AdminListGroupsForUserCommand,
    ListGroupsCommand
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
    region: process.env.COGNITO_REGION
});

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

// Get all users
export const getUsers = async (req, res) => {
    try {
        const command = new ListUsersCommand({
            UserPoolId: USER_POOL_ID,
            Limit: 60
        });

        const response = await client.send(command);

        // Format users with their groups
        const users = await Promise.all(
            response.Users.map(async (user) => {
                const username = user.Username;
                const email = user.Attributes.find(attr => attr.Name === 'email')?.Value || '';
                const emailVerified = user.Attributes.find(attr => attr.Name === 'email_verified')?.Value === 'true';

                // Get user's groups using AdminListGroupsForUser
                let userGroups = [];
                try {
                    const groupsCommand = new AdminListGroupsForUserCommand({
                        UserPoolId: USER_POOL_ID,
                        Username: username
                    });

                    const groupsResponse = await client.send(groupsCommand);
                    userGroups = groupsResponse.Groups?.map(group => group.GroupName) || [];
                } catch (groupError) {
                    console.error(`Error fetching groups for ${username}:`, groupError);
                    userGroups = [];
                }

                return {
                    username,
                    email,
                    emailVerified,
                    status: user.UserStatus,
                    enabled: user.Enabled,
                    createdAt: user.UserCreateDate,
                    groups: userGroups
                };
            })
        );

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
};

// Get available groups
export const getGroups = async (req, res) => {
    try {
        const command = new ListGroupsCommand({
            UserPoolId: USER_POOL_ID
        });

        const response = await client.send(command);
        const groups = response.Groups.map(group => ({
            name: group.GroupName,
            description: group.Description || ''
        }));

        res.status(200).json({ success: true, data: groups });
    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ success: false, message: "Failed to fetch groups" });
    }
};

// Create new user
export const createUser = async (req, res) => {
    const { email, temporaryPassword, role, sendEmail = true } = req.body;

    if (!email || !role) {
        return res.status(400).json({
            success: false,
            message: "Email and role are required"
        });
    }

    try {
        // Prepare user creation parameters
        const createParams = {
            UserPoolId: USER_POOL_ID,
            Username: email,
            UserAttributes: [
                { Name: 'email', Value: email },
                { Name: 'email_verified', Value: 'true' }
            ],
            DesiredDeliveryMediums: sendEmail ? ['EMAIL'] : undefined
        };

        // If temporary password provided, use it and suppress email
        if (temporaryPassword) {
            createParams.TemporaryPassword = temporaryPassword;
            createParams.MessageAction = 'SUPPRESS';
        } else {
            // Let Cognito generate password and send email
            // Remove MessageAction to allow email to be sent
            createParams.MessageAction = undefined;
        }

        const createCommand = new AdminCreateUserCommand(createParams);
        await client.send(createCommand);

        // Add user to group
        const addToGroupCommand = new AdminAddUserToGroupCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
            GroupName: role
        });

        await client.send(addToGroupCommand);

        const responseMessage = temporaryPassword
            ? "User created successfully. No email sent (custom password provided)."
            : "User created successfully. Welcome email sent with temporary password.";

        res.status(201).json({
            success: true,
            message: responseMessage,
            data: { email, role }
        });
    } catch (error) {
        console.error("Error creating user:", error);

        if (error.name === 'UsernameExistsException') {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || "Failed to create user"
        });
    }
};

// Update user (change group/role)
export const updateUser = async (req, res) => {
    const { username } = req.params;
    const { role, currentRole } = req.body;

    if (!role) {
        return res.status(400).json({
            success: false,
            message: "Role is required"
        });
    }

    try {
        // Remove from current group if exists
        if (currentRole) {
            const removeCommand = new AdminRemoveUserFromGroupCommand({
                UserPoolId: USER_POOL_ID,
                Username: username,
                GroupName: currentRole
            });

            await client.send(removeCommand);
        }

        // Add to new group
        const addCommand = new AdminAddUserToGroupCommand({
            UserPoolId: USER_POOL_ID,
            Username: username,
            GroupName: role
        });

        await client.send(addCommand);

        res.status(200).json({
            success: true,
            message: "User updated successfully"
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update user"
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    const { username } = req.params;

    try {
        const command = new AdminDeleteUserCommand({
            UserPoolId: USER_POOL_ID,
            Username: username
        });

        await client.send(command);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete user"
        });
    }
};

// Reset user password (admin)
export const resetPassword = async (req, res) => {
    const { username } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({
            success: false,
            message: "New password is required"
        });
    }

    try {
        const command = new AdminSetUserPasswordCommand({
            UserPoolId: USER_POOL_ID,
            Username: username,
            Password: newPassword,
            Permanent: false // User must change on next login
        });

        await client.send(command);

        res.status(200).json({
            success: true,
            message: "Password reset successfully. User must change password on next login."
        });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to reset password"
        });
    }
};

// Helper function to generate random password
function generateRandomPassword() {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    // Ensure at least one of each required character type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}