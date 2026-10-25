// Counter-proposal form store for managing plan counter-proposals

interface CounterProposalForm {
  fixedFee: number
  hdrPct: number
  placementText: string
}

let counterProposalFormData: CounterProposalForm = {
  fixedFee: 0,
  hdrPct: 0,
  placementText: "",
}

export function setCounterProposalForm(data: CounterProposalForm) {
  counterProposalFormData = { ...data }
}

export function getCounterProposalForm(): CounterProposalForm {
  return { ...counterProposalFormData }
}

export function resetCounterProposalForm() {
  counterProposalFormData = {
    fixedFee: 0,
    hdrPct: 0,
    placementText: "",
  }
}
