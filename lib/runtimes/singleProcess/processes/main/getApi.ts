import { ApplicationDefinition } from '../../../../common/application/ApplicationDefinition';
import { Configuration } from './Configuration';
import { getCorsOrigin } from 'get-cors-origin';
import { getApi as getHandleCommandApi } from '../../../../apis/handleCommand/http';
import { getApi as getObserveDomainEventsApi } from '../../../../apis/observeDomainEvents/http';
import { IdentityProvider } from 'limes';
import { OnReceiveCommand } from '../../../../apis/handleCommand/OnReceiveCommand';
import { PublishDomainEvent } from '../../../../apis/observeDomainEvents/PublishDomainEvent';
import { Repository } from '../../../../common/domain/Repository';
import express, { Application } from 'express';

const getApi = async function ({
  configuration,
  applicationDefinition,
  identityProviders,
  onReceiveCommand,
  repository
}: {
  configuration: Configuration;
  applicationDefinition: ApplicationDefinition;
  identityProviders: IdentityProvider[];
  onReceiveCommand: OnReceiveCommand;
  repository: Repository;
}): Promise<{ api: Application; publishDomainEvent: PublishDomainEvent }> {
  const { api: observeDomainEventsApi, publishDomainEvent } = await getObserveDomainEventsApi({
    corsOrigin: getCorsOrigin(configuration.corsOrigin),
    applicationDefinition,
    identityProviders,
    repository
  });

  const { api: handleCommandApi } = await getHandleCommandApi({
    corsOrigin: getCorsOrigin(configuration.corsOrigin),
    onReceiveCommand,
    applicationDefinition,
    identityProviders
  });

  const api = express();

  api.use('/domain-events', observeDomainEventsApi);
  api.use('/command', handleCommandApi);

  return { api, publishDomainEvent };
};

export { getApi };
