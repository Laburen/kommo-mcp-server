export async function updateContactField(contact_id: number, field_id: number, enum_id: number, kommoClient: any) {
    try {
        const res = await fetch(
            `https://${kommoClient.KOMMO_ACCOUNT_SUBDOMAIN}.kommo.com/api/v4/contacts/${contact_id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${kommoClient.KOMMO_LONG_DURATION_TOKEN}`
                },
                body: JSON.stringify({
                    custom_fields_values: [
                        {
                            field_id: field_id,
                            values: [{ enum_id: enum_id }]
                        }
                    ]
                })
            }
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ updateContactField failed: HTTP ${res.status} - ${errorText}`);
            return null;
        }

        const data = await res.json();
        return data;

    } catch (error) {
        console.error("❌ updateContactField failed: unexpected error while updating contact field.", error);
        return null;
    }
}
