import { createTRPCRouter, publicProcedure } from "../trpc";

import { IngressInput } from "livekit-server-sdk";
import {
  IngressAudioEncodingPreset,
  IngressVideoEncodingPreset,
} from "livekit-server-sdk/dist/proto/livekit_ingress";
import { TrackSource } from "livekit-server-sdk/dist/proto/livekit_models";
import { z } from "zod";

export const ingressRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        roomSlug: z
          .string()
          .regex(/^([a-z][a-z0-9]*)(-[a-z0-9]+)*$/)
          .min(3),
        streamerName: z.string().min(3),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { ingressClient } = ctx;

      const ingress = await ingressClient.createIngress(
        IngressInput.RTMP_INPUT,
        {
          name: input.roomSlug,
          roomName: input.roomSlug,
          participantName: input.streamerName,
          participantIdentity: input.roomSlug,
          video: {
            source: TrackSource.SCREEN_SHARE,
            preset: IngressVideoEncodingPreset.H264_1080P_30FPS_3_LAYERS,
          },
          audio: {
            source: TrackSource.SCREEN_SHARE_AUDIO,
            preset: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS,
          },
        }
      );

      return ingress;
    }),

  deleteAll: publicProcedure.mutation(async ({ ctx }) => {
    const { ingressClient } = ctx;
    const ingresses = await ingressClient.listIngress();

    for (const ingress of ingresses) {
      if (ingress.ingressId) {
        await ingressClient.deleteIngress(ingress.ingressId);
      }
    }
  }),
});
