import { getOrgAdapter } from "./adapter";
import type { Member } from "./schema";
import type { OrganizationOptions, MemberUser } from "./types";
import type { AuthContext } from "../../types";

/**
 * Check if a given user is a member of a given organization,
 * respecting the `afterMemberCheck` hook.
 *
 * @param ctx
 * @param options
 * @param organizationId
 * @param userId
 * @returns
 */
export async function hasMember(
	ctx: AuthContext,
	options: OrganizationOptions | undefined,
	organizationId: string,
	userId: string,
): Promise<(Member & { user: MemberUser }) | null> {
	const adapter = getOrgAdapter(ctx, options);
	let member: (Member & { user: MemberUser }) | null =
		await adapter.findMemberByOrgId({
			userId,
			organizationId,
		});
	if (options?.organizationHooks?.afterMemberCheck) {
		let organization = await adapter.findOrganizationById(organizationId);
		let user = await ctx.internalAdapter.findUserById(userId);
		// we can't call the hook if the org doesn't exist
		if (organization && user) {
			member = await options.organizationHooks.afterMemberCheck({
				user: user,
				organization,
				member,
			});
		}
	}
	return member;
}
