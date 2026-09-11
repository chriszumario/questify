"use client";

import * as React from "react";
import { Ban, CheckCircle2, MoreHorizontal, ShieldAlert, User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteUser,
  toggleUserBan,
  updateUserPlan,
  updateUserRole,
} from "@/features/admin/server/actions";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  banned: boolean | null;
  createdAt: Date;
};

const PAGE_SIZE = 10;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "An error occurred";
}

export function UsersDataTable({ data }: { data: UserRow[] }) {
  const t = useTranslations("AdminUsers.table");
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [isPending, startTransition] = React.useTransition();

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredUsers = normalizedQuery
    ? data.filter((user) =>
        `${user.name} ${user.email}`.toLocaleLowerCase().includes(normalizedQuery)
      )
    : data;
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleUsers = filteredUsers.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  function handleAction(action: () => Promise<unknown>, successMessage: string) {
    startTransition(async () => {
      try {
        await action();
        toast.success(successMessage);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Input
        type="search"
        aria-label={t("search")}
        placeholder={t("search")}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setPage(0);
        }}
        className="max-w-sm"
      />

      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("user")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead>{t("plan")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("joined")}</TableHead>
              <TableHead><span className="sr-only">{t("actions")}</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleUsers.length > 0 ? (
              visibleUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border border-border/50">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name.charAt(0).toUpperCase() || <UserIcon />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">{user.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role === "admin" ? (
                      <Badge className="gap-1.5"><ShieldAlert /> {t("admin")}</Badge>
                    ) : (
                      <Badge variant="secondary">{t("userRole")}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.plan === "pro" ? "default" : "outline"}>
                      {user.plan === "pro" ? t("pro") : t("free")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.banned ? (
                      <Badge variant="destructive" className="gap-1.5"><Ban /> {t("banned")}</Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 /> {t("active")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(user.createdAt))}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={isPending} />}>
                        <MoreHorizontal />
                        <span className="sr-only">{t("actions")}</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleAction(
                            () => updateUserRole(user.id, user.role === "admin" ? "user" : "admin"),
                            t("roleUpdated", { role: user.role === "admin" ? "user" : "admin" })
                          )}>
                            {user.role === "admin" ? t("demote") : t("promote")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(
                            () => updateUserPlan(user.id, user.plan === "pro" ? "free" : "pro"),
                            t("planUpdated", { plan: user.plan === "pro" ? "free" : "pro" })
                          )}>
                            {user.plan === "pro" ? t("downgrade") : t("upgrade")}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => handleAction(
                            () => toggleUserBan(user.id, !user.banned),
                            user.banned ? t("userUnbanned") : t("userBanned")
                          )}>
                            {user.banned ? t("unban") : t("ban")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (window.confirm(t("deleteConfirm", { name: user.name }))) {
                                handleAction(() => deleteUser(user.id), t("userDeleted"));
                              }
                            }}
                          >
                            {t("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {t("noUsers")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filteredUsers.length} {t("user").toLocaleLowerCase()}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={currentPage === 0}>
            {t("previous")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} disabled={currentPage >= pageCount - 1}>
            {t("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
