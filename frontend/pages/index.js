import { useState, useEffect, useRef } from "react";
import { Avatar, Badge, Box, Button, Center, CloseButton, Flex, Float, Grid, GridItem, Group, IconButton, Input, InputGroup, ProgressCircle, Separator, Text } from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import { LuSearch } from "react-icons/lu"
import { set, useForm } from "react-hook-form";
import React from "react"
import { IoMdClose } from "react-icons/io";


React.useLayoutEffect = React.useEffect

export default function Home() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [initData, setInitData] = useState(true);
  const inputRef = useRef(null)


  useEffect(() => {
    setLoading(true);
    setError(null);
    setUsers([]);
    fetch("http://localhost:8000/api/data")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.salesReps || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
        setLoading(false);
      });
  }, [initData]);

  const question = watch("question")

  const handleAskQuestion = handleSubmit(async (v) => {
    setLoading(true);
    setError(null);
    setUsers([]);
    try {
      const response = await fetch("http://localhost:8000/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question }),
      });
      const data = await response.json();
      if (data.answer !== undefined) {
        setError(data.answer);
      }
      setUsers(data.salesReps || []);
    } catch (error) {
      setError("No answer found, please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  });

  const endElement = question ? (
    <CloseButton
      size="xs"
      onClick={() => {
        setInitData(!initData);
        setValue("question", "");
        inputRef.current?.focus()
      }}
      me="-2"
    />
  ) : undefined
  return (
    <Flex minH={"100vh"} direction={"column"} padding={5} gap={4}>
      <Flex gap={4} width={"full"}>
        <form onSubmit={handleAskQuestion} style={{ width: "100%" }}>
          <InputGroup attached w="full" endElement={endElement} startElement={<LuSearch />}>
            <Input flex="1" ref={inputRef} placeholder="Enter your question..." {...register("question")} />
          </InputGroup>
        </form>
      </Flex>
      <Container />
    </Flex>
  );

  function Container() {
    if (loading) {
      return <Center>
        <ProgressCircle.Root value={null} size="sm">
          <ProgressCircle.Circle>
            <ProgressCircle.Track />
            <ProgressCircle.Range />
          </ProgressCircle.Circle>
        </ProgressCircle.Root>
      </Center>
    }
    console.log(error)
    if (error) {
      return <Text>{error}</Text>
    }
    if (users.length === 0) {
      return <Text>No data available</Text>
    }
    return Array.isArray(users) ? users?.map((sales, index) => (
      <Box borderWidth={"thin"} padding={2} borderRadius={"xl"} key={index} my={2} >
        <SalesCard sales={sales} />
        <Grid templateColumns={"1fr 1fr 1fr"} gap="4" >
          <ContainerDeals
            title={<Text fontSize={"md"} fontWeight={"semibold"} color={"yellow.600"}>In Progress</Text>}
            deals={sales.deals.filter((deal) => deal.status === "In Progress")}
            clients={sales.clients}
          />
          <ContainerDeals
            title={<Text fontSize={"md"} fontWeight={"semibold"} color={"green.700"}>Closed Won</Text>}
            deals={sales.deals.filter((deal) => deal.status === "Closed Won")}
            clients={sales.clients}
          />
          <ContainerDeals
            title={<Text fontSize={"md"} fontWeight={"semibold"} color={"red.700"}>Closed Lost</Text>}
            deals={sales.deals.filter((deal) => deal.status === "Closed Lost")}
            clients={sales.clients}
          />
        </Grid>
      </Box>
    )) : users
  }
}


function ContainerDeals({ title, deals, clients }) {
  return (
    <GridItem padding={"2"}  >
      {title}
      <Separator />
      <Flex direction={"column"} paddingTop={2} gap={2}>
        {deals.map((deal, index) => (
          <DealsCard key={index} deal={deal} clients={clients} />
        ))}
      </Flex>
    </GridItem>
  )
}
function DealsCard({ deal, clients }) {
  const client = clients?.filter((c) => c.name === deal.client)[0]
  const industry = client?.industry
  const contact = client?.contact
  return (
    <GridItem borderWidth={"thin"} borderRadius={"xl"} padding={"4"} position="relative">
      <Float offset={"2"} placement={"top-center"} >
        {
          industry
            ? <Badge size="xs" variant="solid" colorPalette="blue">{industry}</Badge>
            : <></>
        }
      </Float>
      <Flex alignItems={"center"} gap={2} justifyContent={"space-between"}>
        <Text fontSize={"md"} >{deal.client}</Text>
        <Text fontSize={"md"} fontWeight={"bold"}>${deal.value}</Text>
      </Flex>
      <Text fontSize={"md"}>{contact}</Text>
    </GridItem>
  )
}
function SalesCard({ sales }) {
  return (
    <Flex gap={4} alignItems={"center"}>
      <Avatar.Root shape="rounded" size="2xl">
        <Avatar.Fallback />
        <Avatar.Image />
      </Avatar.Root>
      <Box>
        <Text fontSize={"md"} fontWeight={"bold"}> {sales.name} ({sales.role})</Text>
        <Text fontSize={"md"} fontWeight={"semibold"}>{sales.region}</Text>
        <Box>
          {
            sales?.skills?.map((skill, index) => (
              <Badge key={index} colorScheme="blue" marginRight={1} >
                {skill}
              </Badge>
            ))
          }
        </Box>
      </Box>
    </Flex>
  )
}