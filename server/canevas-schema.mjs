import {z} from 'zod';
import {money} from './domain.mjs';
import {D1,D2,E} from '../public/canevas.js';
const text=z.string().max(1000).default('');
const date=z.iso.date().or(z.literal('')).default('');
const amount=z.union([z.literal(''),z.string().regex(/^\d{1,14}(\.\d{1,2})?$/).transform(money)]);
const rows=(labels,n,usd)=>z.array(z.object({label:z.string(),currency:usd?z.literal('USD'):z.enum(['USD','CDF','EUR']),values:z.array(amount).length(n)}).strict()).length(labels.length).refine(r=>r.every((x,i)=>x.label===labels[i]),'Rubriques du canevas non conformes');
const signature=z.string().max(20000).regex(/^[ML\d.,\s-]*$/).default('');
export const canevasSchema=z.object({version:z.literal('PNCNS-terrain-V5'),reportingPeriod:text,collectionDate:date,projectReference:text,otherCurrency:text,matrixCurrency:z.enum(['USD','CDF','EUR']),evidence:text,conversionNotes:text,d1:rows(D1,3,false),d2:rows(D2,3,true),forecast:rows(E,4,true),approval:z.object({respondentName:text,respondentPosition:text,respondentDate:date,respondentSignature:signature,teamName:text,supervisorVisa:text,teamDate:date,teamSignature:signature,attested:z.boolean()}).strict()}).strict();
export function checkTerrain(c){if(!c)throw Error('Ouvrez et complétez le questionnaire avec le canevas terrain actuel.');if(!c.collectionDate||!c.reportingPeriod.trim()||!c.projectReference.trim())throw Error('Complétez la date, la période de rapportage et la référence du projet.');const a=c.approval;if(!a.attested||!a.respondentName.trim()||!a.respondentPosition.trim()||!a.respondentDate||!a.teamName.trim()||!a.teamDate||!a.respondentSignature||!a.teamSignature)throw Error('Complétez l’attestation, les noms, la fonction, les dates et les deux signatures terrain.');}
