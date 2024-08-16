import React, {useEffect, useState} from "react";
import {Card, Divider, Flex, Form, message} from "antd";
import {EventAction, getWatchlists, putWatchlist, postWatchlist} from "../../utils/api";
import {AxiosError} from "axios";
import {t} from 'ttag'
import {WatchlistForm} from "../../components/tracking/watchlist/WatchlistForm";
import {WatchlistsList} from "../../components/tracking/watchlist/WatchlistsList";
import {Connector, getConnectors} from "../../utils/api/connectors";
import {showErrorAPI} from "../../utils";


export type Watchlist = {
    name?: string
    token: string,
    domains: { ldhName: string }[],
    triggers?: { event: EventAction, action: string }[],
    connector?: {
        id: string
        provider: string
        createdAt: string
    }
    createdAt: string
}

export default function WatchlistPage() {

    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage()
    const [watchlists, setWatchlists] = useState<Watchlist[] | null>()
    const [connectors, setConnectors] = useState<(Connector & { id: string })[] | null>()

    const onCreateWatchlist = (values: {
        name?: string
        domains: string[],
        emailTriggers: string[]
        connector?: string
    }) => {
        const domainsURI = values.domains.map(d => '/api/domains/' + d)
        postWatchlist({
            name: values.name,
            domains: domainsURI,
            triggers: values.emailTriggers.map(t => ({event: t, action: 'email'})),
            connector: values.connector !== undefined ? ('/api/connectors/' + values.connector) : undefined
        }).then((w) => {
            form.resetFields()
            refreshWatchlists()
            messageApi.success(t`Watchlist created !`)
        }).catch((e: AxiosError) => {
            showErrorAPI(e, messageApi)
        })
    }

    const onUpdateWatchlist = async (values: {
        token: string
        name?: string
        domains: string[],
        emailTriggers: string[]
        connector?: string
    }) => {
        const domainsURI = values.domains.map(d => '/api/domains/' + d)

        return putWatchlist({
            token: values.token,
            name: values.name,
            domains: domainsURI,
            triggers: values.emailTriggers.map(t => ({event: t, action: 'email'})),
            connector: values.connector !== undefined ? ('/api/connectors/' + values.connector) : undefined
        }).then((w) => {
            refreshWatchlists()
            messageApi.success(t`Watchlist updated !`)
        }).catch((e: AxiosError) => {
            throw showErrorAPI(e, messageApi)
        })
    }

    const refreshWatchlists = () => getWatchlists().then(w => {
        setWatchlists(w['hydra:member'])
    }).catch((e: AxiosError) => {
        setWatchlists(undefined)
        showErrorAPI(e, messageApi)
    })

    useEffect(() => {
        refreshWatchlists()
        getConnectors()
            .then(c => setConnectors(c['hydra:member']))
            .catch((e: AxiosError) => {
                showErrorAPI(e, messageApi)
            })
    }, [])

    return <Flex gap="middle" align="center" justify="center" vertical>
        {contextHolder}
        {
            connectors &&
            <Card title={t`Create a Watchlist`} style={{width: '100%'}}>
                <WatchlistForm form={form} onFinish={onCreateWatchlist} connectors={connectors} isCreation={true}/>
            </Card>
        }
        <Divider/>
        {connectors && watchlists && watchlists.length > 0 &&
            <WatchlistsList watchlists={watchlists} onDelete={refreshWatchlists}
                            connectors={connectors}
                            onUpdateWatchlist={onUpdateWatchlist}
            />}
    </Flex>
}