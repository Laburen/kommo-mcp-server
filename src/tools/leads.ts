const CLOSED_LOST_STATUS_ID = 143; // estado de sistema "Cerrado - no logrado" (perdido)

// Mapeo de marca -> tag_id para Pueyrredón Motos (case-insensitive). Cualquier marca no listada usa "multimarca".
const BRAND_TAG_IDS: Record<string, number> = {
    honda: 2112127,
    voge: 2111938,
    hero: 2120830,
};
const MULTIMARCA_TAG_ID = 2186866;

export function resolveBrandTagId(bike_brand: string): number {
    const key = bike_brand.trim().toLowerCase();
    return BRAND_TAG_IDS[key] ?? MULTIMARCA_TAG_ID;
}

export async function getLead(lead_id: number, kommoCLient: any) {
    try {
        const res = await fetch(`https://${kommoCLient.KOMMO_ACCOUNT_SUBDOMAIN}.kommo.com/api/v4/leads/${lead_id}`, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${kommoCLient.KOMMO_LONG_DURATION_TOKEN}`
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ getLead failed: HTTP ${res.status} - ${errorText}`);
            return null;
        }

        const data = await res.json();
        return data || null;

    } catch (error) {
        console.error("❌ getLead failed: unexpected error during lead retrieval.", error);
        return null;
    }
}

export async function moveLead(lead_id: number, pipeline_id: number, status_id: number, kommoCLient: any) {
    try {
        const res = await fetch(`https://${kommoCLient.KOMMO_ACCOUNT_SUBDOMAIN}.kommo.com/api/v4/leads/${lead_id}`,
            {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${kommoCLient.KOMMO_LONG_DURATION_TOKEN}`
                },
                body: JSON.stringify({
                    pipeline_id: pipeline_id,
                    status_id: status_id
                })
            }
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ moveLead failed: HTTP ${res.status} - ${errorText}`);
            return null;
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("❌ moveLead failed: unable to update pipeline or status for the specified lead.", error);
        return null;
    }
}

export async function closeLead(lead_id: number, loss_reason_id: number, kommoCLient: any) {
    try {
        const res = await fetch(`https://${kommoCLient.KOMMO_ACCOUNT_SUBDOMAIN}.kommo.com/api/v4/leads/${lead_id}`,
            {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${kommoCLient.KOMMO_LONG_DURATION_TOKEN}`
                },
                body: JSON.stringify({
                    status_id: CLOSED_LOST_STATUS_ID,
                    loss_reason_id: loss_reason_id
                })
            }
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ closeLead failed: HTTP ${res.status} - ${errorText}`);
            return null;
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("❌ closeLead failed: unable to close the specified lead.", error);
        return null;
    }
}

export async function pauseLeadAgent(lead_id: number, switch_field_id: number, switch_field_value: boolean, kommoClient: any) {
    try {
        const res = await fetch(`https://${kommoClient.KOMMO_ACCOUNT_SUBDOMAIN}.kommo.com/api/v4/leads/${lead_id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${kommoClient.KOMMO_LONG_DURATION_TOKEN}`
            },
            body: JSON.stringify({
                custom_fields_values: [
                    {
                        field_id: switch_field_id,
                        values: [
                            { value: switch_field_value }
                        ]
                    }
                ]
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ pauseLeadAgent failed: HTTP ${res.status} - ${errorText}`);
            return null;
        }

        const data = await res.json();
        return data;

    } catch (error) {
        console.error("❌ pauseLeadAgent failed: unexpected error while pausing the agent.", error);
        return null;
    }
}

export async function addNoteToLead(lead_id: number, kommoClient: any, note: string) {
    try {
        const res = await fetch(
            `https://${kommoClient.KOMMO_ACCOUNT_SUBDOMAIN}.kommo.com/api/v4/leads/${lead_id}/notes`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    Authorization: `Bearer ${kommoClient.KOMMO_LONG_DURATION_TOKEN}`
                },
                body: JSON.stringify([
                    {
                        note_type: "common",
                        text: `${note}`
                    }
                ])
            }
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ addNoteToLead failed: HTTP ${res.status} - ${errorText}`);
            return null;
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("❌ addNoteToLead failed: unexpected error while adding note to lead.", error);
        return null;
    }
}

export async function addTagToLead(lead_id: number, tag_id: number, kommoCLient: any) {
    try {
        const res = await fetch(`https://${kommoCLient.KOMMO_ACCOUNT_SUBDOMAIN}.kommo.com/api/v4/leads/${lead_id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    Authorization: `Bearer ${kommoCLient.KOMMO_LONG_DURATION_TOKEN}`
                },
                body: JSON.stringify({
                    tags_to_add: [
                        {
                            "id": tag_id
                        }
                    ]
                })
            }
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ addTagToLead failed: HTTP ${res.status} - ${errorText}`);
            return null;
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("❌ addTagToLead failed: unexpected error while adding tag to lead.", error);
        return null;
    }
}

export async function addBudgetToLead(lead_id: number, price: number, kommoClient: any) {
    try {
        const res = await fetch(
            `https://${kommoClient.KOMMO_ACCOUNT_SUBDOMAIN}.kommo.com/api/v4/leads`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${kommoClient.KOMMO_LONG_DURATION_TOKEN}`
                },
                body: JSON.stringify([
                    {
                        id: lead_id,
                        price: price
                    }
                ])
            }
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ addBudgetToLead failed: HTTP ${res.status} - ${errorText}`);
            return null;
        }

        const data = await res.json();
        return data;

    } catch (error) {
        console.error("❌ addBudgetToLead failed: unexpected error while adding budget to lead.", error);
        return null;
    }
}