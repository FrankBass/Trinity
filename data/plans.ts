import type { Plan } from "./types"

export const plans: Plan[] = [
  // Plan 1: Submitted (just created by affiliate)
  {
    id: "plan-1",
    opId: "op-1",
    affiliateId: "affiliate-igral",
    status: "Submitted",
    currentVersion: 1,
    versions: [
      {
        at: "2025-03-01T10:00:00Z",
        actorRole: "Affiliate",
        changes: {
          comment: "Proposition initiale pour VP Printemps",
          feeEur: [3000, 3000],
          hdrPct: [12, 12],
          nvxPct: [7, 7],
          ancPct: [4, 4],
        },
      },
    ],
    createdAt: "2025-03-01T10:00:00Z",
    updatedAt: "2025-03-01T10:00:00Z",
  },
  // Plan 2: InDiscussion (AM counter-proposed)
  {
    id: "plan-2",
    opId: "op-1",
    affiliateId: "affiliate-mr",
    status: "InDiscussion",
    currentVersion: 2,
    versions: [
      {
        at: "2025-03-02T09:00:00Z",
        actorRole: "Affiliate",
        changes: {
          comment: "Demande initiale",
          feeEur: [4000, 4000],
          hdrPct: [14, 14],
          nvxPct: [8, 8],
          ancPct: [5, 5],
        },
      },
      {
        at: "2025-03-03T14:30:00Z",
        actorRole: "AM",
        changes: {
          feeEur: [4000, 3500],
          hdrPct: [14, 13],
          nvxPct: [8, 7.5],
          ancPct: [5, 4.5],
          comment: "Contre-proposition AM - budget ajusté",
        },
      },
    ],
    createdAt: "2025-03-02T09:00:00Z",
    updatedAt: "2025-03-03T14:30:00Z",
  },
  // Plan 3: ValidatedAffiliate (affiliate accepted AM counter-proposal)
  {
    id: "plan-3",
    opId: "op-3",
    affiliateId: "affiliate-css",
    status: "ValidatedAffiliate",
    currentVersion: 3,
    versions: [
      {
        at: "2025-02-20T11:00:00Z",
        actorRole: "Affiliate",
        changes: {
          feeEur: [2500, 2500],
          hdrPct: [10, 10],
          nvxPct: [6, 6],
          ancPct: [3, 3],
        },
      },
      {
        at: "2025-02-21T15:00:00Z",
        actorRole: "AM",
        changes: {
          feeEur: [2500, 2200],
          hdrPct: [10, 9],
          nvxPct: [6, 5.5],
          ancPct: [3, 3],
          comment: "Ajustement budget",
        },
      },
      {
        at: "2025-02-22T10:00:00Z",
        actorRole: "Affiliate",
        changes: {
          feeEur: [2200, 2200],
          hdrPct: [9, 9],
          nvxPct: [5.5, 5.5],
          ancPct: [3, 3],
          comment: "Accepté",
        },
      },
    ],
    createdAt: "2025-02-20T11:00:00Z",
    updatedAt: "2025-02-22T10:00:00Z",
  },
  // Plan 4: PendingClient (finalized by AM, waiting for client decision)
  {
    id: "plan-4",
    opId: "op-1",
    affiliateId: "affiliate-igral",
    status: "PendingClient",
    currentVersion: 2,
    versions: [
      {
        at: "2025-02-25T09:00:00Z",
        actorRole: "Affiliate",
        changes: {
          feeEur: [4500, 4500],
          hdrPct: [15, 15],
          nvxPct: [8, 8],
          ancPct: [5, 5],
        },
      },
      {
        at: "2025-02-26T11:00:00Z",
        actorRole: "AM",
        changes: {
          feeEur: [4500, 4200],
          hdrPct: [15, 14],
          nvxPct: [8, 7.5],
          ancPct: [5, 4.5],
          comment: "Finalisé pour validation client",
        },
      },
    ],
    snapshot: {
      feeEur: 4200,
      hdrPct: 14,
      nvxPct: 7.5,
      ancPct: 4.5,
      commissionPct: 28,
      finalizedAt: "2025-02-26T11:00:00Z",
      finalizedBy: "user-am-a",
    },
    createdAt: "2025-02-25T09:00:00Z",
    updatedAt: "2025-02-26T11:00:00Z",
  },
  // Plan 5: ClientOnHold (client requested more info)
  {
    id: "plan-5",
    opId: "op-3",
    affiliateId: "affiliate-mr",
    status: "ClientOnHold",
    currentVersion: 2,
    versions: [
      {
        at: "2025-02-15T10:00:00Z",
        actorRole: "Affiliate",
        changes: {
          feeEur: [2800, 2800],
          hdrPct: [11, 11],
          nvxPct: [6.5, 6.5],
          ancPct: [4, 4],
        },
      },
      {
        at: "2025-02-16T14:00:00Z",
        actorRole: "AM",
        changes: {
          feeEur: [2800, 2600],
          hdrPct: [11, 10],
          nvxPct: [6.5, 6],
          ancPct: [4, 3.5],
          comment: "Finalisé",
        },
      },
    ],
    snapshot: {
      feeEur: 2600,
      hdrPct: 10,
      nvxPct: 6,
      ancPct: 3.5,
      commissionPct: 22,
      finalizedAt: "2025-02-16T14:00:00Z",
      finalizedBy: "user-am-a",
    },
    createdAt: "2025-02-15T10:00:00Z",
    updatedAt: "2025-02-18T09:00:00Z",
  },
  // Plan 6: ClientApproved
  {
    id: "plan-6",
    opId: "op-1",
    affiliateId: "affiliate-css",
    status: "ClientApproved",
    currentVersion: 2,
    versions: [
      {
        at: "2025-02-10T10:00:00Z",
        actorRole: "Affiliate",
        changes: {
          feeEur: [3200, 3200],
          hdrPct: [13, 13],
          nvxPct: [7, 7],
          ancPct: [4, 4],
        },
      },
      {
        at: "2025-02-11T15:00:00Z",
        actorRole: "AM",
        changes: {
          feeEur: [3200, 3000],
          hdrPct: [13, 12],
          nvxPct: [7, 6.5],
          ancPct: [4, 4],
          comment: "Finalisé",
        },
      },
    ],
    snapshot: {
      feeEur: 3000,
      hdrPct: 12,
      nvxPct: 6.5,
      ancPct: 4,
      commissionPct: 28,
      finalizedAt: "2025-02-11T15:00:00Z",
      finalizedBy: "user-am-a",
    },
    createdAt: "2025-02-10T10:00:00Z",
    updatedAt: "2025-02-12T10:00:00Z",
  },
  // Plan 7: ClientRejected
  {
    id: "plan-7",
    opId: "op-3",
    affiliateId: "affiliate-igral",
    status: "ClientRejected",
    currentVersion: 2,
    versions: [
      {
        at: "2025-02-05T09:00:00Z",
        actorRole: "Affiliate",
        changes: {
          feeEur: [5000, 5000],
          hdrPct: [18, 18],
          nvxPct: [10, 10],
          ancPct: [6, 6],
        },
      },
      {
        at: "2025-02-06T11:00:00Z",
        actorRole: "AM",
        changes: {
          feeEur: [5000, 4500],
          hdrPct: [18, 16],
          nvxPct: [10, 9],
          ancPct: [6, 5.5],
          comment: "Finalisé",
        },
      },
    ],
    snapshot: {
      feeEur: 4500,
      hdrPct: 16,
      nvxPct: 9,
      ancPct: 5.5,
      commissionPct: 22,
      finalizedAt: "2025-02-06T11:00:00Z",
      finalizedBy: "user-am-a",
    },
    createdAt: "2025-02-05T09:00:00Z",
    updatedAt: "2025-02-07T14:00:00Z",
  },
  // Plan 8: Another PendingClient
  {
    id: "plan-8",
    opId: "op-4",
    affiliateId: "affiliate-mr",
    status: "PendingClient",
    currentVersion: 1,
    versions: [
      {
        at: "2025-03-05T10:00:00Z",
        actorRole: "AM",
        changes: {
          comment: "Plan direct AM pour UK Launch",
          feeEur: [6000, 6000],
          hdrPct: [16, 16],
          nvxPct: [8.5, 8.5],
          ancPct: [5, 5],
        },
      },
    ],
    snapshot: {
      feeEur: 6000,
      hdrPct: 16,
      nvxPct: 8.5,
      ancPct: 5,
      commissionPct: 20,
      finalizedAt: "2025-03-05T10:00:00Z",
      finalizedBy: "user-am-a",
    },
    createdAt: "2025-03-05T10:00:00Z",
    updatedAt: "2025-03-05T10:00:00Z",
  },
  // Plan 9: InDiscussion (new plan)
  {
    id: "pl_001",
    opId: "op_srp_octrose",
    clientId: "cli_srp",
    affiliateId: "aff_jean",
    placementText: "Homepage carousel – 2 jours\nPush app – 1 jour",
    hdrPct: 5,
    fixedFeeAffEur: 600,
    fileUrls: [],
    status: "InDiscussion",
    versions: [
      {
        at: "2025-10-02T10:00:00Z",
        actorRole: "Affiliate",
        changes: {
          comment: "Proposition initiale",
          hdrPct: [5, 5],
          fixedFeeAffEur: [800, 800],
        },
      },
      {
        at: "2025-10-03T09:00:00Z",
        actorRole: "AM",
        changes: {
          fixedFeeAffEur: [800, 600],
          comment: "600€ max côté budget",
        },
      },
    ],
    createdAt: "2025-10-02T10:00:00Z",
    updatedAt: "2025-10-03T09:00:00Z",
  },
  // Plan 10: PendingClient (new plan)
  {
    id: "pl_002",
    opId: "op_srp_octrose",
    clientId: "cli_srp",
    affiliateId: "aff_jean",
    placementText: "Newsletter solo + post social",
    hdrPctNvx: 12,
    hdrPctAnc: 6,
    fixedFeeAffEur: 0,
    fileUrls: [],
    status: "PendingClient",
    versions: [
      {
        at: "2025-10-04T11:00:00Z",
        actorRole: "Affiliate",
        changes: {
          hdrPctNvx: [10, 12],
          hdrPctAnc: [5, 6],
          comment: "Demande +2%/+1%",
        },
      },
      {
        at: "2025-10-04T15:20:00Z",
        actorRole: "AM",
        changes: {
          comment: "OK pour finaliser et envoyer client",
        },
      },
    ],
    createdAt: "2025-10-04T11:00:00Z",
    updatedAt: "2025-10-04T15:20:00Z",
  },
  // Plan 11: ClientApproved (new plan)
  {
    id: "pl_003",
    opId: "op_srp_backtoschool",
    clientId: "cli_srp",
    affiliateId: "aff_jean",
    placementText: "Catégorie lifestyle – 1 semaine",
    hdrPct: 3,
    fixedFeeAffEur: 300,
    fileUrls: [],
    status: "ClientApproved",
    versions: [
      {
        at: "2025-08-22T08:00:00Z",
        actorRole: "Client",
        changes: {
          comment: "Validé",
        },
      },
    ],
    createdAt: "2025-08-20T09:00:00Z",
    updatedAt: "2025-08-22T08:00:00Z",
  },
]
