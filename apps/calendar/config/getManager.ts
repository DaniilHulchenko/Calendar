export const getManager = async (id: string) => {
  const response = await fetch(`/api/users/${id}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: "manager" }),
  });
};
